"use server";

// Ações do console da agenda. TODO(auth): validar a sessão e o papel de Admin no início de cada ação —
// server actions são endpoints públicos; hoje só o proxy (src/proxy.ts) restringe o acesso.
import { revalidatePath } from "next/cache";
import { autorAuditoria } from "@/lib/sessao";
import { listarPessoas } from "@/lib/pessoas";
import { atualizarEstado, registrarAuditoria } from "./armazenamento";
import { executarSincronizacao } from "./sincronizacao";

const CHAVE = /^[\w-]{1,64}:[\w-]{1,64}$/;

const autor = autorAuditoria;

function texto(formData: FormData, campo: string) {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor.trim() : "";
}

export async function sincronizarAgora() {
  await executarSincronizacao(await autor());
  revalidatePath("/admin", "layout");
}

/**
 * Vincula a participação a uma pessoa (US-05.06). Não cadastra o e-mail do Sympla como alternativo
 * (RN-05.06.1). TODO(gamificação): recalcular a pontuação da pessoa quando o ÉP-08 existir.
 */
export async function vincularParticipacao(formData: FormData) {
  const chave = texto(formData, "chave");
  // A busca manual (quando nenhuma sugestão serve) tem prioridade sobre as sugestões por nome.
  const pessoaId = texto(formData, "pessoaManual") || texto(formData, "pessoaId");
  const descricao = texto(formData, "descricao").slice(0, 300);
  if (!CHAVE.test(chave) || !pessoaId) return;
  const pessoa = (await listarPessoas()).find((p) => p.id === pessoaId);
  if (!pessoa) return;

  const por = await autor();
  await atualizarEstado((estado) => {
    estado.resolucoes[chave] = { tipo: "vinculo", pessoaId, em: new Date().toISOString(), por };
    registrarAuditoria(estado, { por, acao: "Vínculo manual de participação", detalhes: `${descricao} → ${pessoa.nome}` });
  });
  revalidatePath("/admin", "layout");
}

/** "Não é membro": sai da fila, mas continua contando nos números do evento (US-05.06). */
export async function marcarNaoMembro(formData: FormData) {
  const chaves = formData
    .getAll("chave")
    .filter((c): c is string => typeof c === "string" && CHAVE.test(c));
  if (chaves.length === 0) return;

  const por = await autor();
  await atualizarEstado((estado) => {
    for (const chave of chaves) {
      estado.resolucoes[chave] = { tipo: "nao-membro", em: new Date().toISOString(), por };
    }
    registrarAuditoria(estado, {
      por,
      acao: "Participação marcada como não membro",
      detalhes: `${chaves.length} participação(ões): ${chaves.join(", ")}`,
    });
  });
  revalidatePath("/admin", "layout");
}

/** Desfaz um vínculo manual ou um "não é membro": a participação volta à fila. */
export async function desfazerResolucao(formData: FormData) {
  const chave = texto(formData, "chave");
  if (!CHAVE.test(chave)) return;

  const por = await autor();
  await atualizarEstado((estado) => {
    const anterior = estado.resolucoes[chave];
    if (!anterior) return;
    delete estado.resolucoes[chave];
    registrarAuditoria(estado, {
      por,
      acao: anterior.tipo === "vinculo" ? "Vínculo manual desfeito" : "Marcação de não membro desfeita",
      detalhes: chave,
    });
  });
  revalidatePath("/admin", "layout");
}
