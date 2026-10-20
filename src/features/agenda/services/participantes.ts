// Participantes dos eventos, vindos do Sympla (US-05.04). Fonte única para a situação da pessoa na agenda
// e para o console do Admin: cada evento é consultado uma vez e compartilhado em cache.
// Contém dados pessoais: roda só no servidor e nunca deve ser repassado inteiro a telas de Filiado/Não-Filiado.
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Evento, ParticipanteEvento } from "../types";
import { listarTodasAsPaginas } from "./sympla/cliente";
import { paraIso } from "./sympla/mapeamento";
import type { SymplaParticipante } from "./sympla/tipos";

export type SituacaoIngresso = "ativos" | "cancelados";

export function tagParticipantes(eventoId: string) {
  return `agenda-participantes-${eventoId}`;
}

/** Depois disso, correções de check-in ficam raras: a lista do evento pode ficar um dia em cache. */
const DIAS_ATE_ESTABILIZAR = 7;

export function estabilizado(evento: Evento, agora: Date) {
  return new Date(evento.fim).getTime() + DIAS_ATE_ESTABILIZAR * 24 * 60 * 60 * 1000 < agora.getTime();
}

function paraParticipante(eventoId: string, p: SymplaParticipante, cancelado: boolean): ParticipanteEvento {
  return {
    id: String(p.id),
    eventoId,
    nome: [p.first_name, p.last_name].map((parte) => parte?.trim()).filter(Boolean).join(" "),
    email: (p.email ?? "").trim().toLowerCase(),
    tipoIngresso: p.ticket_name?.trim() || "Ingresso",
    checkIn: p.checkin?.check_in === true,
    checkInEm: p.checkin?.check_in && p.checkin.check_in_date ? paraIso(p.checkin.check_in_date) : undefined,
    cancelado,
  };
}

/**
 * Consulta direta ao Sympla, sem cache. Usada pela sincronização manual, que só invalida o cache
 * depois de conseguir os dados novos (se o Sympla falhar, nada do que já existe é perdido — US-05.03).
 */
export async function buscarParticipantesNoSympla(
  eventoId: string,
  situacao: SituacaoIngresso,
): Promise<ParticipanteEvento[]> {
  const participantes = await listarTodasAsPaginas<SymplaParticipante>(`/events/${eventoId}/participants`, {
    // Só os campos que a plataforma armazena (RN-05.04.4).
    fields: "id,first_name,last_name,email,ticket_name,ticket_status,checkin",
    cancelled_filter: situacao === "cancelados" ? "only" : "none",
    page_size: 500,
  });
  return participantes.map((p) => paraParticipante(eventoId, p, situacao === "cancelados"));
}

/** Participantes de um evento, em cache: 1 hora para eventos recentes, 1 dia depois que estabilizam. */
export async function listarParticipantes(
  eventoId: string,
  situacao: SituacaoIngresso,
  eventoEstabilizado: boolean,
): Promise<ParticipanteEvento[]> {
  "use cache";
  if (eventoEstabilizado) cacheLife("days");
  else cacheLife("hours");
  cacheTag(tagParticipantes(eventoId));

  return buscarParticipantesNoSympla(eventoId, situacao);
}

/** Executa as tarefas com no máximo `limite` em paralelo (o cliente do Sympla ainda aplica o limite global). */
export async function emLotes<T, R>(itens: T[], limite: number, tarefa: (item: T) => Promise<R>): Promise<R[]> {
  const resultados: R[] = new Array(itens.length);
  let proximo = 0;
  async function trabalhador() {
    while (proximo < itens.length) {
      const indice = proximo++;
      resultados[indice] = await tarefa(itens[indice]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limite, itens.length) }, trabalhador));
  return resultados;
}
