import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useSessao } from "@/shared/sessao/useSessao";

import type { FiltrosConteudos } from "../tipos/conteudo";
import { listarCatalogo, listarCatalogoCompleto, listarCategorias } from "./conteudos.api";

export const chavesConteudos = {
  catalogo: (filtros: FiltrosConteudos, filiado: boolean) =>
    ["conteudos", "catalogo", { ...filtros, filiado }] as const,
  catalogoCompleto: (filiado: boolean) => ["conteudos", "catalogo-completo", { filiado }] as const,
  categorias: ["conteudos", "categorias"] as const,
};

export function useEhPrevia(): boolean {
  const { estado, ehFiliado } = useSessao();
  return estado === "autenticado" && !ehFiliado;
}

export function useCatalogoCompleto() {
  const { estado, ehFiliado } = useSessao();
  return useQuery({
    queryKey: chavesConteudos.catalogoCompleto(ehFiliado),
    queryFn: listarCatalogoCompleto,
    enabled: estado !== "carregando",
  });
}

export function useCatalogo(filtros: FiltrosConteudos = {}) {
  const { estado, ehFiliado } = useSessao();
  return useQuery({
    queryKey: chavesConteudos.catalogo(filtros, ehFiliado),
    queryFn: () => listarCatalogo(filtros),
    enabled: estado !== "carregando",
    placeholderData: keepPreviousData,
  });
}

export function useCategoriasConteudo() {
  const { estado } = useSessao();
  return useQuery({
    queryKey: chavesConteudos.categorias,
    queryFn: listarCategorias,
    enabled: estado !== "carregando",
  });
}
