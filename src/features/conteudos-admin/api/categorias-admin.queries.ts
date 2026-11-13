import { useMutation, useQueryClient } from "@tanstack/react-query";

import { chavesConteudos } from "@/features/conteudos/api/conteudos.queries";
import type { CategoriaConteudo } from "@/features/conteudos/tipos/conteudo";

import { ordenarCategorias, type NovaOrdem } from "../lib/ordem-categorias";
import {
  atualizarCategoria,
  criarCategoria,
  type AtualizarCategoria,
} from "./categorias-admin.api";
import { chavesConteudosAdmin } from "./conteudos-admin.queries";

function useInvalidarCategorias() {
  const clienteConsultas = useQueryClient();
  return () => {
    void clienteConsultas.invalidateQueries({ queryKey: ["conteudos"] });
    void clienteConsultas.invalidateQueries({ queryKey: chavesConteudosAdmin.todas });
  };
}

export function useCriarCategoria() {
  const invalidar = useInvalidarCategorias();
  return useMutation({ mutationFn: criarCategoria, onSuccess: invalidar });
}

export function useRenomearCategoria() {
  const invalidar = useInvalidarCategorias();
  return useMutation({
    mutationFn: ({ cod_categoria, ...dados }: AtualizarCategoria & { cod_categoria: string }) =>
      atualizarCategoria(cod_categoria, dados),
    onSuccess: invalidar,
  });
}

export function useReordenarCategorias() {
  const clienteConsultas = useQueryClient();
  const invalidar = useInvalidarCategorias();
  const chave = chavesConteudos.categorias;
  return useMutation({
    mutationFn: (novas: NovaOrdem[]) =>
      Promise.all(
        novas.map(({ cod_categoria, ordem }) => atualizarCategoria(cod_categoria, { ordem })),
      ),
    onMutate: async (novas) => {
      await clienteConsultas.cancelQueries({ queryKey: chave });
      const anteriores = clienteConsultas.getQueryData<CategoriaConteudo[]>(chave);
      if (anteriores) clienteConsultas.setQueryData(chave, ordenarCategorias(anteriores, novas));
      return { anteriores };
    },
    onError: (_erro, _novas, contexto) => {
      if (contexto?.anteriores) clienteConsultas.setQueryData(chave, contexto.anteriores);
    },
    onSettled: invalidar,
  });
}
