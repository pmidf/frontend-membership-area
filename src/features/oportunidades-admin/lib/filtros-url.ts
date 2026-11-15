import {
  SITUACOES_OPORTUNIDADE,
  type SituacaoOportunidade,
} from "@/features/oportunidades/tipos/oportunidade";
import { paginaDaUrl } from "@/shared/lib/pagina-da-url";

import type { ConsultaOportunidadesAdmin } from "../tipos/oportunidade-admin";

export const TAMANHO_MAXIMO_BUSCA = 100;

export type FiltrosVagasAdmin = {
  q: string;
  situacao: SituacaoOportunidade | "";
  pagina: number;
};

function situacaoDaUrl(valor: string | null): SituacaoOportunidade | "" {
  return SITUACOES_OPORTUNIDADE.find((situacao) => situacao === valor) ?? "";
}

export function filtrosDaUrl(parametros: Pick<URLSearchParams, "get">): FiltrosVagasAdmin {
  return {
    q: (parametros.get("q") ?? "").trim().slice(0, TAMANHO_MAXIMO_BUSCA),
    situacao: situacaoDaUrl(parametros.get("situacao")),
    pagina: paginaDaUrl(parametros.get("pagina")),
  };
}

export function consultaDaLista({
  q,
  situacao,
  pagina,
}: FiltrosVagasAdmin): ConsultaOportunidadesAdmin {
  return {
    ...(q && { q }),
    ...(situacao && { situacao }),
    ...(pagina > 1 && { page: pagina }),
  };
}

export function temFiltroAplicado({ q, situacao }: FiltrosVagasAdmin): boolean {
  return q !== "" || situacao !== "";
}
