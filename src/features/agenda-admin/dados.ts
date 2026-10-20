// Leitura de dados para o console da agenda. Roda só no servidor: lida com dados pessoais de participantes.
import "server-only";
import { listarPessoas } from "@/lib/pessoas";
import { emLotes, estabilizado, listarParticipantes } from "@/features/agenda/services/participantes";
import { listarEventos } from "@/features/agenda/services/agenda-service";
import type { Evento, ParticipanteEvento } from "@/features/agenda/types";
import { lerEstado } from "./armazenamento";
import { calcularNumeros, type NumerosEvento } from "./numeros";
import { DIAS_RECENTES, type PeriodoAdmin } from "./periodo";
import { montarBase, resolverVinculo, type Vinculo } from "./vinculos";

/** Chamadas simultâneas por tela; o cliente do Sympla ainda aplica o limite global do processo. */
const CONCORRENCIA = 3;

export { lerPeriodoAdmin, type PeriodoAdmin } from "./periodo";

export async function eventosDoPeriodo(periodo: PeriodoAdmin, agora: Date): Promise<Evento[]> {
  const eventos = await listarEventos();
  const limite = agora.getTime() - DIAS_RECENTES * 24 * 60 * 60 * 1000;
  return eventos
    .filter((e) => periodo === "12m" || new Date(e.fim).getTime() >= limite)
    .sort((a, b) => new Date(b.inicio).getTime() - new Date(a.inicio).getTime());
}

async function participantesDe(evento: Evento, agora: Date) {
  const fixo = estabilizado(evento, agora);
  const [ativos, cancelados] = await Promise.all([
    listarParticipantes(evento.id, "ativos", fixo),
    listarParticipantes(evento.id, "cancelados", fixo),
  ]);
  return { ativos, cancelados };
}

/** Números de cada evento. Falha num evento não derruba a tela: ele aparece como indisponível. */
export async function numerosDosEventos(eventos: Evento[], agora: Date): Promise<Map<string, NumerosEvento>> {
  const resultados = await emLotes(eventos, CONCORRENCIA, async (evento) => {
    try {
      const { ativos, cancelados } = await participantesDe(evento, agora);
      return calcularNumeros(evento, ativos, cancelados, agora);
    } catch {
      return { ...calcularNumeros(evento, [], [], agora), indisponivel: true };
    }
  });
  return new Map(resultados.map((n) => [n.eventoId, n]));
}

export type ParticipanteComVinculo = ParticipanteEvento & { vinculo: Vinculo };

export async function participantesComVinculo(evento: Evento, agora: Date): Promise<ParticipanteComVinculo[]> {
  const [{ ativos, cancelados }, pessoas, estado] = await Promise.all([
    participantesDe(evento, agora),
    listarPessoas(),
    lerEstado(),
  ]);
  const base = montarBase(pessoas, estado.resolucoes);
  return [...ativos, ...cancelados]
    .map((p) => ({ ...p, vinculo: resolverVinculo(p, base) }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

/** Participações ativas sem vínculo, de todos os eventos do período (fila da US-05.06). */
export async function participacoesNaoVinculadas(eventos: Evento[], agora: Date) {
  const consultaveis = eventos.filter((e) => !e.cancelado);
  const [listas, pessoas, estado] = await Promise.all([
    emLotes(consultaveis, CONCORRENCIA, (evento) =>
      listarParticipantes(evento.id, "ativos", estabilizado(evento, agora)).catch(() => null),
    ),
    listarPessoas(),
    lerEstado(),
  ]);
  const base = montarBase(pessoas, estado.resolucoes);
  const falhas = listas.filter((l) => l === null).length;
  const todos = listas.flatMap((lista) => lista ?? []);
  const pendentes = todos.filter((p) => resolverVinculo(p, base).tipo === "nao-vinculado");
  return { pendentes, todos, pessoas, estado, falhas };
}
