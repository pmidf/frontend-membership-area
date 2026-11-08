import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { ehErroApi } from "@/shared/api/erro-api";
import { useSessao } from "@/shared/sessao/useSessao";

import type { FiltrosBeneficios } from "../tipos/beneficio";
import { detalharBeneficio, listarBeneficios } from "./beneficios.api";

export const chavesBeneficios = {
  listas: ["beneficios", "lista"] as const,
  lista: (filtros: FiltrosBeneficios, filiado: boolean) =>
    ["beneficios", "lista", { ...filtros, filiado }] as const,
  detalhe: (id: string) => ["beneficios", "detalhe", id] as const,
};

export function filiacaoNecessaria(erro: unknown): boolean {
  return ehErroApi(erro) && erro.status === 403;
}

export function beneficioNaoEncontrado(erro: unknown): boolean {
  return ehErroApi(erro) && erro.status === 404;
}

export function useBeneficios(filtros: FiltrosBeneficios = {}) {
  const { estado, ehFiliado } = useSessao();
  return useQuery({
    queryKey: chavesBeneficios.lista(filtros, ehFiliado),
    queryFn: () => listarBeneficios(filtros),
    enabled: estado !== "carregando",
    placeholderData: keepPreviousData,
  });
}

export function useBeneficio(id: string) {
  return useQuery({
    queryKey: chavesBeneficios.detalhe(id),
    queryFn: () => detalharBeneficio(id),
    retry: (falhas, erro) =>
      !filiacaoNecessaria(erro) && !beneficioNaoEncontrado(erro) && falhas < 1,
  });
}
