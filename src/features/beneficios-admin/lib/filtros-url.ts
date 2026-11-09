import {
  CATEGORIAS_BENEFICIO,
  type CategoriaBeneficio,
  type TipoResgate,
} from "@/features/beneficios/tipos/beneficio";
import { paginaDaUrl } from "@/shared/lib/pagina-da-url";

import {
  ORDENACOES_BENEFICIO,
  SITUACOES_BENEFICIO,
  TIPOS_RESGATE,
  VIGENCIAS_BENEFICIO,
  type ConsultaBeneficiosAdmin,
  type FiltrosBeneficiosAdmin,
  type OrdenacaoBeneficio,
  type SituacaoBeneficio,
  type VigenciaBeneficio,
} from "../tipos/beneficio-admin";

export const TAMANHO_MAXIMO_BUSCA = 100;

export type FiltrosTela = {
  q: string;
  situacao: SituacaoBeneficio | "";
  tipo_resgate: TipoResgate | "";
  categoria: CategoriaBeneficio | "";
  vigencia: VigenciaBeneficio | "";
  ordenar: OrdenacaoBeneficio | "";
  pagina: number;
};

function permitido<T extends string>(lista: readonly T[], valor: string | null): T | "" {
  return lista.includes(valor as T) ? (valor as T) : "";
}

export function filtrosDaUrl(parametros: Pick<URLSearchParams, "get">): FiltrosTela {
  return {
    q: (parametros.get("q") ?? "").trim().slice(0, TAMANHO_MAXIMO_BUSCA),
    situacao: permitido(SITUACOES_BENEFICIO, parametros.get("situacao")),
    tipo_resgate: permitido(TIPOS_RESGATE, parametros.get("tipo_resgate")),
    categoria: permitido(CATEGORIAS_BENEFICIO, parametros.get("categoria")),
    vigencia: permitido(VIGENCIAS_BENEFICIO, parametros.get("vigencia")),
    ordenar: permitido(ORDENACOES_BENEFICIO, parametros.get("ordenar")),
    pagina: paginaDaUrl(parametros.get("pagina")),
  };
}

export function filtrosDeExportacao({
  q,
  situacao,
  tipo_resgate,
  categoria,
  vigencia,
}: FiltrosTela): FiltrosBeneficiosAdmin {
  return {
    ...(q && { q }),
    ...(situacao && { situacao }),
    ...(tipo_resgate && { tipo_resgate }),
    ...(categoria && { categoria }),
    ...(vigencia && { vigencia }),
  };
}

export function consultaDaLista(filtros: FiltrosTela): ConsultaBeneficiosAdmin {
  const { ordenar, pagina } = filtros;
  return {
    ...filtrosDeExportacao(filtros),
    ...(ordenar && { ordenar }),
    ...(pagina > 1 && { page: pagina }),
  };
}

export function temFiltroAplicado(filtros: FiltrosTela): boolean {
  return Object.keys(filtrosDeExportacao(filtros)).length > 0;
}
