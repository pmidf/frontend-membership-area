// Participantes de um evento (US-05.05), como vêm do backend. Filtros locais da tabela;
// a exportação CSV usa os mesmos filtros, aplicados no backend.
import { formatarCheckIn } from "./formatacao";

export type VinculoLinha =
  | { tipo: "vinculado"; pessoaId: string; pessoaNome: string; origem: "automatico" | "manual" }
  | { tipo: "nao-membro" }
  | { tipo: "nao-vinculado" };

export type LinhaParticipante = {
  /** Id do participante no Sympla. */
  id: string;
  nome: string;
  email: string;
  tipoIngresso: string;
  checkIn: boolean;
  checkInEm: string | null;
  cancelado: boolean;
  vinculo: VinculoLinha;
};

export type FiltrosParticipantes = {
  busca?: string;
  checkIn?: "confirmado" | "pendente" | "cancelado";
  tipo?: string;
  vinculo?: VinculoLinha["tipo"];
};

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
    if (filtros.vinculo && l.vinculo.tipo !== filtros.vinculo) return false;
    return true;
  });
}

export function rotuloCheckIn(l: LinhaParticipante, encerrado: boolean) {
  if (l.cancelado) return "Ingresso cancelado";
  if (l.checkIn) return l.checkInEm ? `Confirmado · ${formatarCheckIn(l.checkInEm)}` : "Confirmado";
  return encerrado ? "Não compareceu" : "Pendente";
}

export function rotuloVinculo(vinculo: VinculoLinha) {
  if (vinculo.tipo === "vinculado") return vinculo.pessoaNome;
  return vinculo.tipo === "nao-membro" ? "Não é membro" : "Não vinculado";
}
