import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

import { ehErroApi } from "@/shared/api/erro-api";
import { useSessao } from "@/shared/sessao/useSessao";

import type { FiltrosOportunidades } from "../tipos/oportunidade";
import {
  detalharOportunidade,
  listarOportunidades,
  solicitarCandidatura,
} from "./oportunidades.api";

export const chavesOportunidades = {
  todas: ["oportunidades"] as const,
  lista: (filtros: FiltrosOportunidades, filiado: boolean) =>
    ["oportunidades", "lista", { ...filtros, filiado }] as const,
  detalhe: (id: string) => ["oportunidades", "detalhe", id] as const,
};

const temStatus = (status: number) => (erro: unknown) => ehErroApi(erro) && erro.status === status;

export const filiacaoNecessaria = temStatus(403);
export const oportunidadeNaoEncontrada = temStatus(404);
export const oportunidadeEncerrada = temStatus(410);
export const muitasTentativas = temStatus(429);

export function useOportunidades(filtros: FiltrosOportunidades = {}) {
  const { estado, ehFiliado } = useSessao();
  return useQuery({
    queryKey: chavesOportunidades.lista(filtros, ehFiliado),
    queryFn: () => listarOportunidades(filtros),
    enabled: estado !== "carregando",
    placeholderData: keepPreviousData,
  });
}

export function useOportunidade(id: string) {
  return useQuery({
    queryKey: chavesOportunidades.detalhe(id),
    queryFn: () => detalharOportunidade(id),
    retry: (falhas, erro) =>
      !filiacaoNecessaria(erro) &&
      !oportunidadeNaoEncontrada(erro) &&
      !oportunidadeEncerrada(erro) &&
      falhas < 1,
  });
}

export function useCandidatura(id: string) {
  return useMutation({ mutationFn: () => solicitarCandidatura(id) });
}
