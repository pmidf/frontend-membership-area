// Acesso aos dados da agenda pelo backend (backend-membership-area), que lê o Sympla.
// O frontend não fala com o Sympla: token e dados de participantes ficam no backend.
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { backendJson, backendJsonOuNulo } from "@/lib/backend";
import type { Usuario } from "@/lib/sessao";
import type { Evento, EventoComParticipacao, StatusParticipacao } from "../types";

export const TAG_EVENTOS = "agenda-eventos";

/** O backend aceita até 50 eventos por consulta de situação (cada evento é uma leitura no Sympla). */
const EVENTOS_POR_CONSULTA = 50;

/** Eventos dos últimos 12 meses e futuros. Dados públicos: cache curto no servidor do Next. */
export async function listarEventos(): Promise<Evento[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAG_EVENTOS);
  return backendJson<Evento[]>("/agenda/eventos");
}

export async function obterEvento(id: string): Promise<Evento | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(TAG_EVENTOS);
  return backendJsonOuNulo<Evento>(`/agenda/eventos/${encodeURIComponent(id)}`);
}

export async function listarCategorias(): Promise<string[]> {
  const eventos = await listarEventos();
  return [...new Set(eventos.map((e) => e.categoria))].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

/** Eventos ainda sem a situação da pessoa: usado enquanto as participações carregam. */
export function semParticipacao(eventos: Evento[]): EventoComParticipacao[] {
  return eventos.map((evento) => ({ ...evento, participacao: null }));
}

/**
 * Anexa a situação da pessoa autenticada (Inscrito / Presente / Ausente) a cada evento (US-05.02).
 * O backend usa os e-mails verificados da pessoa (tabela `email`) e os vínculos manuais da conciliação.
 * Só a própria participação é consultada (RN-05.02.1); sem cache, pois é dado pessoal.
 * TODO(auth): o backend vai identificar a pessoa pela sessão, sem receber o id no corpo.
 */
export async function comParticipacao(eventos: Evento[], usuario: Usuario | null): Promise<EventoComParticipacao[]> {
  if (!usuario || eventos.length === 0) return semParticipacao(eventos);

  const ids = [...new Set(eventos.map((e) => e.id))];
  const lotes = Array.from({ length: Math.ceil(ids.length / EVENTOS_POR_CONSULTA) }, (_, i) =>
    ids.slice(i * EVENTOS_POR_CONSULTA, (i + 1) * EVENTOS_POR_CONSULTA),
  );
  const situacoes = (
    await Promise.all(
      lotes.map((eventoIds) =>
        backendJson<{ eventoId: string; status: StatusParticipacao }[]>("/agenda/participacoes/situacao", {
          method: "POST",
          corpo: { pessoaId: usuario.id, eventoIds },
        }),
      ),
    ).catch(() => []) // falha na consulta não derruba a agenda: os eventos só ficam sem o status da pessoa
  ).flat();

  const porEvento = new Map(situacoes.map((s) => [s.eventoId, s.status]));
  return eventos.map((evento) => ({ ...evento, participacao: porEvento.get(evento.id) ?? null }));
}
