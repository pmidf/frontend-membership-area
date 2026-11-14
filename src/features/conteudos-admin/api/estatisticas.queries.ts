import { keepPreviousData, useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

import { ehErroApi } from "@/shared/api/erro-api";

import type { PeriodoEstatisticas } from "../tipos/conteudo-admin";
import { exportarAcessos, listarAcessos, obterEstatisticas } from "./estatisticas.api";

export const chavesEstatisticas = {
  estatisticas: (id: string, periodo: PeriodoEstatisticas) =>
    ["conteudos-admin", "estatisticas", id, periodo] as const,
  acessos: (id: string) => ["conteudos-admin", "acessos", id] as const,
};

const erroDoCliente = (erro: unknown) => ehErroApi(erro) && erro.status >= 400 && erro.status < 500;

export function useEstatisticas(id: string, periodo: PeriodoEstatisticas) {
  return useQuery({
    queryKey: chavesEstatisticas.estatisticas(id, periodo),
    queryFn: () => obterEstatisticas(id, periodo),
    placeholderData: keepPreviousData,
    retry: (falhas, erro) => !erroDoCliente(erro) && falhas < 1,
  });
}

export function useAcessos(id: string) {
  return useInfiniteQuery({
    queryKey: chavesEstatisticas.acessos(id),
    queryFn: ({ pageParam }) => listarAcessos(id, pageParam),
    initialPageParam: 1,
    getNextPageParam: ({ pagina, total_paginas }) =>
      pagina < total_paginas ? pagina + 1 : undefined,
  });
}

export function useExportarAcessos(id: string) {
  return useMutation({ mutationFn: () => exportarAcessos(id) });
}
