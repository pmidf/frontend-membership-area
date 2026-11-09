import { paginaDaUrl } from "@/shared/lib/pagina-da-url";

import {
  CATEGORIAS_BENEFICIO,
  type CategoriaBeneficio,
  type FiltrosBeneficios,
} from "../tipos/beneficio";

export const TAMANHO_MAXIMO_BUSCA = 100;

export type FiltrosCatalogo = {
  q: string;
  categoria: CategoriaBeneficio | "";
  pagina: number;
};

function ehCategoria(valor: string | null): valor is CategoriaBeneficio {
  return CATEGORIAS_BENEFICIO.includes(valor as CategoriaBeneficio);
}

export function filtrosDaUrl(parametros: Pick<URLSearchParams, "get">): FiltrosCatalogo {
  const categoria = parametros.get("categoria");
  return {
    q: (parametros.get("q") ?? "").trim().slice(0, TAMANHO_MAXIMO_BUSCA),
    categoria: ehCategoria(categoria) ? categoria : "",
    pagina: paginaDaUrl(parametros.get("pagina")),
  };
}

export function filtrosParaApi({ q, categoria, pagina }: FiltrosCatalogo): FiltrosBeneficios {
  return {
    ...(q && { q }),
    ...(categoria && { categoria }),
    ...(pagina > 1 && { page: pagina }),
  };
}
