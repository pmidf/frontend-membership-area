import { paginaDaUrl } from "@/shared/lib/pagina-da-url";

import {
  MODALIDADES,
  type FiltrosOportunidades,
  type Modalidade,
  type OrdenacaoVagas,
} from "../tipos/oportunidade";

export const TAMANHO_MAXIMO_BUSCA = 100;

export type FiltrosVagas = {
  q: string;
  modalidade: Modalidade | "";
  ordenar: OrdenacaoVagas;
  pagina: number;
};

function modalidadeDaUrl(valor: string | null): Modalidade | "" {
  return MODALIDADES.find((modalidade) => modalidade === valor) ?? "";
}

export function filtrosDaUrl(parametros: Pick<URLSearchParams, "get">): FiltrosVagas {
  return {
    q: (parametros.get("q") ?? "").trim().slice(0, TAMANHO_MAXIMO_BUSCA),
    modalidade: modalidadeDaUrl(parametros.get("modalidade")),
    ordenar: parametros.get("ordenar") === "alfabetica" ? "alfabetica" : "recentes",
    pagina: paginaDaUrl(parametros.get("pagina")),
  };
}

export function filtrosParaApi({
  q,
  modalidade,
  ordenar,
  pagina,
}: FiltrosVagas): FiltrosOportunidades {
  return {
    ...(q && { q }),
    ...(modalidade && { modalidade }),
    ...(ordenar === "alfabetica" && { ordenar }),
    ...(pagina > 1 && { page: pagina }),
  };
}
