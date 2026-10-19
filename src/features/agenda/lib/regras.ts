// Regras de negócio da agenda (ÉP-05, US-05.01).
import type { Evento, EventoComParticipacao, FiltrosAgenda, FormatoEvento, PeriodoAgenda } from "../types";

const UM_DIA_MS = 24 * 60 * 60 * 1000;

/** Cancelados continuam visíveis com a marca "Cancelado" por 7 dias após a data original. */
export const DIAS_VISIBILIDADE_CANCELADO = 7;

export function formatoDoEvento(evento: Evento): FormatoEvento {
  return evento.endereco ? "presencial" : "online";
}

export function rotuloFormato(formato: FormatoEvento) {
  return formato === "presencial" ? "Presencial" : "Online";
}

export function jaAconteceu(evento: Evento, agora = new Date()) {
  return new Date(evento.fim).getTime() < agora.getTime();
}

/** O botão "Inscrever-se no Sympla" só aparece para evento futuro e não cancelado. */
export function aceitaInscricao(evento: Evento, agora = new Date()) {
  return !evento.cancelado && !jaAconteceu(evento, agora);
}

export function visivelNaAgenda(evento: Evento, agora = new Date()) {
  if (!evento.cancelado) return true;
  const limite = new Date(evento.inicio).getTime() + DIAS_VISIBILIDADE_CANCELADO * UM_DIA_MS;
  return agora.getTime() <= limite;
}

function porInicio(a: Evento, b: Evento) {
  return new Date(a.inicio).getTime() - new Date(b.inicio).getTime();
}

function dentroDoPeriodo(evento: Evento, periodo: PeriodoAgenda, agora: Date) {
  const passado = jaAconteceu(evento, agora);
  if (periodo === "passados") return passado && !evento.cancelado;
  if (passado && !evento.cancelado) return false;
  if (periodo === "proximos") return true;
  const dias = periodo === "30d" ? 30 : 90;
  return new Date(evento.inicio).getTime() <= agora.getTime() + dias * UM_DIA_MS;
}

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/** Filtros de busca, formato e categoria (valem para lista e calendário). */
export function atendeFiltros(evento: Evento, filtros: Omit<FiltrosAgenda, "periodo">) {
  if (filtros.formato && formatoDoEvento(evento) !== filtros.formato) return false;
  if (filtros.categoria && evento.categoria !== filtros.categoria) return false;
  if (filtros.busca && !normalizar(evento.titulo).includes(normalizar(filtros.busca))) return false;
  return true;
}

/**
 * Lista da agenda: próximos em ordem crescente de data;
 * "Eventos passados" em ordem decrescente (US-05.01 c10).
 */
export function filtrarParaLista<T extends Evento>(eventos: T[], filtros: FiltrosAgenda, agora = new Date()): T[] {
  const resultado = eventos
    .filter((e) => visivelNaAgenda(e, agora))
    .filter((e) => dentroDoPeriodo(e, filtros.periodo, agora))
    .filter((e) => atendeFiltros(e, filtros))
    .sort(porInicio);
  return filtros.periodo === "passados" ? resultado.reverse() : resultado;
}

/** Eventos encerrados mais recentes, para a seção "Eventos que já aconteceram". */
export function eventosRecentesEncerrados<T extends Evento>(eventos: T[], limite: number, agora = new Date()): T[] {
  return eventos
    .filter((e) => !e.cancelado && jaAconteceu(e, agora))
    .sort(porInicio)
    .reverse()
    .slice(0, limite);
}

export function rotuloParticipacao(evento: EventoComParticipacao) {
  switch (evento.participacao) {
    case "inscrito":
      return "Inscrição confirmada";
    case "presente":
      return "Presença confirmada";
    case "ausente":
      return "Inscrição sem presença";
    default:
      return null;
  }
}
