import { UFS } from "@/shared/endereco/ufs";
import { paginaDaUrl } from "@/shared/lib/pagina-da-url";

import type { FiltrosProfissionais as FiltrosApi } from "../tipos/profissional";

export const TAMANHO_MAXIMO_TEXTO = 100;

export type FiltrosProfissionais = {
  q: string;
  uf: string;
  cidade: string;
  pagina: number;
};

const textoDaUrl = (valor: string | null) => (valor ?? "").trim().slice(0, TAMANHO_MAXIMO_TEXTO);

function ufDaUrl(valor: string | null): string {
  const uf = (valor ?? "").trim().toUpperCase();
  return UFS.find((opcao) => opcao === uf) ?? "";
}

export function filtrosDaUrl(parametros: Pick<URLSearchParams, "get">): FiltrosProfissionais {
  return {
    q: textoDaUrl(parametros.get("q")),
    uf: ufDaUrl(parametros.get("uf")),
    cidade: textoDaUrl(parametros.get("cidade")),
    pagina: paginaDaUrl(parametros.get("pagina")),
  };
}

export function filtrosParaApi({ q, uf, cidade, pagina }: FiltrosProfissionais): FiltrosApi {
  return {
    ...(q && { q }),
    ...(cidade && { cidade }),
    ...(uf && { uf }),
    ...(pagina > 1 && { page: pagina }),
  };
}
