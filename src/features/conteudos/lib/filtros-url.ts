import { paginaDaUrl } from "@/shared/lib/pagina-da-url";

import type { FiltrosConteudos, TipoConteudo } from "../tipos/conteudo";

export const TAMANHO_MAXIMO_BUSCA = 100;

const FORMATO_UUID = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export type FiltrosCatalogo = {
  q: string;
  tipo: TipoConteudo | "";
  categoria: string;
  pagina: number;
};

function ehTipo(valor: string | null): valor is TipoConteudo {
  return valor === "VIDEO" || valor === "MATERIAL";
}

export function filtrosDaUrl(parametros: Pick<URLSearchParams, "get">): FiltrosCatalogo {
  const tipo = parametros.get("tipo");
  const categoria = parametros.get("categoria") ?? "";
  return {
    q: (parametros.get("q") ?? "").trim().slice(0, TAMANHO_MAXIMO_BUSCA),
    tipo: ehTipo(tipo) ? tipo : "",
    categoria: FORMATO_UUID.test(categoria) ? categoria : "",
    pagina: paginaDaUrl(parametros.get("pagina")),
  };
}

export function filtrosParaApi({ q, tipo, categoria, pagina }: FiltrosCatalogo): FiltrosConteudos {
  return {
    ...(q && { q }),
    ...(tipo && { tipo }),
    ...(categoria && { categoria }),
    ...(pagina > 1 && { page: pagina }),
  };
}
