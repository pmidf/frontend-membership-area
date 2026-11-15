import { TAMANHO_MAXIMO_BUSCA } from "@/features/conteudos/lib/filtros-url";
import { paginaDaUrl } from "@/shared/lib/pagina-da-url";
import { SITUACOES_PUBLICACAO, type SituacaoPublicacao } from "@/shared/publicacao/situacao";

import type { ConsultaTrilhasAdmin } from "../tipos/trilha-admin";

export type FiltrosTrilhasAdmin = {
  q: string;
  situacao: SituacaoPublicacao | "";
  pagina: number;
};

function ehSituacao(valor: string | null): valor is SituacaoPublicacao {
  return SITUACOES_PUBLICACAO.includes(valor as SituacaoPublicacao);
}

export function filtrosTrilhasDaUrl(parametros: Pick<URLSearchParams, "get">): FiltrosTrilhasAdmin {
  const situacao = parametros.get("situacao");
  return {
    q: (parametros.get("q") ?? "").trim().slice(0, TAMANHO_MAXIMO_BUSCA),
    situacao: ehSituacao(situacao) ? situacao : "",
    pagina: paginaDaUrl(parametros.get("pagina")),
  };
}

export function consultaDasTrilhas({
  q,
  situacao,
  pagina,
}: FiltrosTrilhasAdmin): ConsultaTrilhasAdmin {
  return {
    ...(q && { q }),
    ...(situacao && { situacao }),
    ...(pagina > 1 && { page: pagina }),
  };
}
