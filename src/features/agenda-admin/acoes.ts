"use server";

// Ações do console da agenda: repassam ao backend, que aplica as regras e registra a auditoria.
// TODO(auth): validar a sessão e o papel de Admin aqui e no backend — server actions são endpoints públicos;
// hoje só o proxy (src/proxy.ts) e a guarda provisória do backend restringem o acesso.
import { revalidatePath, updateTag } from "next/cache";
import { obterAdminAtual } from "@/lib/sessao";
import { TAG_EVENTOS } from "@/features/agenda/services/agenda-service";
import * as api from "./api";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Ids do Sympla (evento e participante): curtos e sem separadores. */
const ID_SYMPLA = /^[\w-]{1,30}$/;

async function autor() {
  return (await obterAdminAtual()).nome;
}

function texto(formData: FormData, campo: string) {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor.trim() : "";
}

/** Inscrição vinda do formulário, como "eventoId:participanteId" (checkbox) ou em dois campos ocultos. */
function inscricao(valor: unknown): api.Inscricao | null {
  if (typeof valor !== "string") return null;
  const [eventoId, participanteId] = valor.split(":");
  return ID_SYMPLA.test(eventoId ?? "") && ID_SYMPLA.test(participanteId ?? "") ? { eventoId, participanteId } : null;
}

function inscricaoDoFormulario(formData: FormData) {
  return inscricao(`${texto(formData, "eventoId")}:${texto(formData, "participanteId")}`);
}

/** "Atualizar agora": o backend lê tudo de novo do Sympla (sem esperar o cache de alguns minutos). */
export async function atualizarAgora() {
  await api.atualizar(await autor());
  // A agenda pública também guarda os eventos em cache por alguns minutos: atualiza na hora.
  updateTag(TAG_EVENTOS);
  revalidatePath("/admin", "layout");
}

/**
 * Vincula a participação a uma pessoa (US-05.06). A busca manual (quando nenhuma sugestão serve)
 * tem prioridade sobre as sugestões por nome.
 */
export async function vincularParticipacao(formData: FormData) {
  const alvo = inscricaoDoFormulario(formData);
  const pessoaId = texto(formData, "pessoaManual") || texto(formData, "pessoaId");
  if (!alvo || !UUID.test(pessoaId)) return;
  await api.vincular(alvo, pessoaId, await autor());
  revalidatePath("/admin", "layout");
}

/** "Não é membro": sai da fila, mas continua contando nos números do evento (US-05.06). */
export async function marcarNaoMembro(formData: FormData) {
  // Da fila vêm várias inscrições ("eventoId:participanteId"); do card "Em análise", uma só (campos ocultos).
  const selecionadas = formData.getAll("inscricao").map(inscricao);
  const inscricoes = selecionadas.length > 0 ? selecionadas : [inscricaoDoFormulario(formData)];
  const validas = inscricoes.filter((i): i is api.Inscricao => i !== null);
  if (validas.length === 0) return;
  await api.marcarNaoMembros(validas, await autor());
  revalidatePath("/admin", "layout");
}

/** Desfaz um vínculo manual ou um "não é membro": a participação volta à fila. */
export async function desfazerResolucao(formData: FormData) {
  const alvo = inscricaoDoFormulario(formData);
  if (!alvo) return;
  await api.desfazer(alvo, await autor());
  revalidatePath("/admin", "layout");
}
