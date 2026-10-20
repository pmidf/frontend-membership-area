// Lista de participantes de um evento (US-05.05), em formato serializável: usada pela tabela no navegador
// e pela exportação CSV no servidor, com os mesmos filtros.
import type { ParticipanteComVinculo } from "./dados";
import { formatarCheckIn } from "./formatacao";
import { chaveParticipacao } from "./vinculos";

export type VinculoLinha = "vinculado" | "nao-vinculado" | "nao-membro";

export type LinhaParticipante = {
  chave: string;
  nome: string;
  email: string;
  tipoIngresso: string;
  checkIn: boolean;
  checkInEm?: string;
  cancelado: boolean;
  vinculo: VinculoLinha;
  /** Nome da pessoa vinculada na plataforma. */
  pessoa?: string;
  vinculoManual: boolean;
};

export type FiltrosParticipantes = {
  busca?: string;
  checkIn?: "confirmado" | "pendente" | "cancelado";
  tipo?: string;
  vinculo?: VinculoLinha;
};

export function montarLinhasParticipantes(participantes: ParticipanteComVinculo[]): LinhaParticipante[] {
  return participantes.map((p) => ({
    chave: chaveParticipacao(p),
    nome: p.nome || "(sem nome)",
    email: p.email,
    tipoIngresso: p.tipoIngresso,
    checkIn: p.checkIn,
    checkInEm: p.checkInEm,
    cancelado: p.cancelado,
    vinculo: p.vinculo.tipo === "pessoa" ? "vinculado" : p.vinculo.tipo,
    pessoa: p.vinculo.tipo === "pessoa" ? p.vinculo.pessoa.nome : undefined,
    vinculoManual: p.vinculo.tipo === "pessoa" && p.vinculo.origem === "manual",
  }));
}

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function filtrarParticipantes(linhas: LinhaParticipante[], filtros: FiltrosParticipantes) {
  const busca = filtros.busca ? normalizar(filtros.busca) : "";
  return linhas.filter((l) => {
    if (busca && !normalizar(`${l.nome} ${l.email}`).includes(busca)) return false;
    if (filtros.checkIn === "cancelado" && !l.cancelado) return false;
    if (filtros.checkIn === "confirmado" && (l.cancelado || !l.checkIn)) return false;
    if (filtros.checkIn === "pendente" && (l.cancelado || l.checkIn)) return false;
    if (filtros.tipo && l.tipoIngresso !== filtros.tipo) return false;
    if (filtros.vinculo && l.vinculo !== filtros.vinculo) return false;
    return true;
  });
}

export function lerFiltrosParticipantes(params: URLSearchParams): FiltrosParticipantes {
  const checkIn = params.get("checkin");
  const vinculo = params.get("vinculo");
  return {
    busca: params.get("q") || undefined,
    checkIn: checkIn === "confirmado" || checkIn === "pendente" || checkIn === "cancelado" ? checkIn : undefined,
    tipo: params.get("tipo") || undefined,
    vinculo: vinculo === "vinculado" || vinculo === "nao-vinculado" || vinculo === "nao-membro" ? vinculo : undefined,
  };
}

export function rotuloCheckIn(l: LinhaParticipante, encerrado: boolean) {
  if (l.cancelado) return "Ingresso cancelado";
  if (l.checkIn) return l.checkInEm ? `Confirmado · ${formatarCheckIn(l.checkInEm)}` : "Confirmado";
  return encerrado ? "Não compareceu" : "Pendente";
}

export function rotuloVinculoLinha(l: LinhaParticipante) {
  if (l.vinculo === "vinculado") return l.pessoa ?? "Vinculado";
  return l.vinculo === "nao-membro" ? "Não é membro" : "Não vinculado";
}

export function linhasCsvParticipantes(linhas: LinhaParticipante[], encerrado: boolean) {
  return [
    ["Nome", "E-mail", "Tipo de ingresso", "Check-in", "Vínculo com conta"],
    ...linhas.map((l) => [l.nome, l.email, l.tipoIngresso, rotuloCheckIn(l, encerrado), rotuloVinculoLinha(l)]),
  ];
}
