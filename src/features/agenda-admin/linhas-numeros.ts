// Linhas da visão analítica (US-05.05), como vêm do backend. Filtros locais da tabela;
// a exportação CSV usa os mesmos filtros, aplicados no backend.
import type { FormatoEvento } from "@/features/agenda/types";
import type { SituacaoEvento } from "./numeros";

export type LinhaNumeros = {
  id: string;
  titulo: string;
  inicio: string;
  formato: FormatoEvento;
  categoria: string;
  situacao: SituacaoEvento;
  cancelado: boolean;
  encerrado: boolean;
  inscritos: number;
  presentes: number;
  ausentes: number;
  cancelados: number;
  taxa: number | null;
};

export type FiltrosNumeros = {
  busca?: string;
  situacao?: SituacaoEvento;
  formato?: FormatoEvento;
  categoria?: string;
};

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function filtrarLinhas(linhas: LinhaNumeros[], filtros: FiltrosNumeros) {
  const busca = filtros.busca ? normalizar(filtros.busca) : "";
  return linhas.filter(
    (l) =>
      (!busca || normalizar(l.titulo).includes(busca)) &&
      (!filtros.situacao || l.situacao === filtros.situacao) &&
      (!filtros.formato || l.formato === filtros.formato) &&
      (!filtros.categoria || l.categoria === filtros.categoria),
  );
}
