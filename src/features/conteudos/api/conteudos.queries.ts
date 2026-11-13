import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ehErroApi } from "@/shared/api/erro-api";

import { useSessao } from "@/shared/sessao/useSessao";

import { levarAba } from "../lib/abrir-em-nova-aba";
import type { ConteudoAcessivel, DetalheConteudo, FiltrosConteudos } from "../tipos/conteudo";
import {
  abrirMaterial,
  abrirPlayer,
  desmarcarVisto,
  detalharConteudo,
  listarCatalogo,
  listarCatalogoCompleto,
  listarCategorias,
  marcarVisto,
} from "./conteudos.api";

export const chavesConteudos = {
  catalogo: (filtros: FiltrosConteudos, filiado: boolean) =>
    ["conteudos", "catalogo", { ...filtros, filiado }] as const,
  catalogoCompleto: (filiado: boolean) => ["conteudos", "catalogo-completo", { filiado }] as const,
  categorias: ["conteudos", "categorias"] as const,
  detalhe: (id: string) => ["conteudos", "detalhe", id] as const,
  player: (id: string, publico: boolean) => ["conteudos", "player", id, { publico }] as const,
};

const listasDoCatalogo = [
  ["conteudos", "catalogo"],
  ["conteudos", "catalogo-completo"],
] as const;

export function conteudoNaoEncontrado(erro: unknown): boolean {
  return ehErroApi(erro) && erro.status === 404;
}

export function filiacaoNecessaria(erro: unknown): boolean {
  return ehErroApi(erro) && erro.status === 403;
}

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

export function useConteudo(id: string) {
  const { estado } = useSessao();
  return useQuery({
    queryKey: chavesConteudos.detalhe(id),
    queryFn: () => detalharConteudo(id),
    enabled: estado !== "carregando",
    retry: (falhas, erro) => !conteudoNaoEncontrado(erro) && falhas < 1,
  });
}

export function usePlayer(id: string, publico: boolean) {
  return useQuery({
    queryKey: chavesConteudos.player(id, publico),
    queryFn: () => abrirPlayer(id, publico),
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useAlternarVisto(id: string) {
  const clienteConsultas = useQueryClient();
  const chave = chavesConteudos.detalhe(id);

  return useMutation({
    mutationFn: (marcar: boolean) => (marcar ? marcarVisto(id) : desmarcarVisto(id)),
    onMutate: async (marcar) => {
      await clienteConsultas.cancelQueries({ queryKey: chave });
      const anterior = clienteConsultas.getQueryData<DetalheConteudo>(chave);
      if (anterior && !anterior.bloqueado) {
        const atualizado: ConteudoAcessivel = {
          ...anterior,
          consumido: marcar,
          data_consumo: marcar ? new Date().toISOString() : null,
        };
        clienteConsultas.setQueryData<DetalheConteudo>(chave, atualizado);
      }
      return { anterior };
    },
    onError: (_erro, _marcar, contexto) => {
      if (contexto?.anterior) clienteConsultas.setQueryData(chave, contexto.anterior);
    },
    onSettled: () => {
      [chave, ...listasDoCatalogo].forEach(
        (queryKey) => void clienteConsultas.invalidateQueries({ queryKey }),
      );
    },
  });
}

export function useAbrirMaterial(id: string) {
  return useMutation({
    mutationFn: async (aba: Window | null) => {
      try {
        levarAba(aba, (await abrirMaterial(id)).url);
      } catch (erro) {
        aba?.close();
        throw erro;
      }
    },
  });
}
