import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { ehErroApi } from "@/shared/api/erro-api";
import { useSessao } from "@/shared/sessao/useSessao";

import type { FiltrosProfissionais } from "../tipos/profissional";
import { detalharProfissional, listarProfissionais } from "./profissionais.api";

export const chavesProfissionais = {
  todas: ["profissionais"] as const,
  lista: (filtros: FiltrosProfissionais) => ["profissionais", "lista", filtros] as const,
  detalhe: (id: string) => ["profissionais", "detalhe", id] as const,
};

export const profissionalNaoEncontrado = (erro: unknown) => ehErroApi(erro) && erro.status === 404;

export function useProfissionais(filtros: FiltrosProfissionais = {}) {
  const { estado } = useSessao();
  return useQuery({
    queryKey: chavesProfissionais.lista(filtros),
    queryFn: () => listarProfissionais(filtros),
    enabled: estado !== "carregando",
    placeholderData: keepPreviousData,
  });
}

export function useProfissional(id: string) {
  return useQuery({
    queryKey: chavesProfissionais.detalhe(id),
    queryFn: () => detalharProfissional(id),
    retry: (falhas, erro) => !profissionalNaoEncontrado(erro) && falhas < 1,
  });
}
