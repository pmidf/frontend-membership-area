import {
  filtrosDaUrl as filtrosDoCatalogo,
  filtrosParaApi as filtrosDoCatalogoParaApi,
  type FiltrosCatalogo,
} from "@/features/conteudos/lib/filtros-url";
import { SITUACOES_PUBLICACAO, type SituacaoPublicacao } from "@/shared/publicacao/situacao";

import type { ConsultaConteudosAdmin } from "../tipos/conteudo-admin";

export type FiltrosConteudosAdmin = FiltrosCatalogo & { situacao: SituacaoPublicacao | "" };

function ehSituacao(valor: string | null): valor is SituacaoPublicacao {
  return SITUACOES_PUBLICACAO.includes(valor as SituacaoPublicacao);
}

export function filtrosDaUrl(parametros: Pick<URLSearchParams, "get">): FiltrosConteudosAdmin {
  const situacao = parametros.get("situacao");
  return { ...filtrosDoCatalogo(parametros), situacao: ehSituacao(situacao) ? situacao : "" };
}

export function consultaDaLista({
  situacao,
  ...filtros
}: FiltrosConteudosAdmin): ConsultaConteudosAdmin {
  return { ...filtrosDoCatalogoParaApi(filtros), ...(situacao && { situacao }) };
}

export function temFiltroAplicado({ q, tipo, categoria, situacao }: FiltrosConteudosAdmin) {
  return Boolean(q || tipo || categoria || situacao);
}
