import { api } from "@/shared/api/cliente-http";

import type {
  AcessoMaterial,
  Catalogo,
  CategoriaConteudo,
  DetalheConteudo,
  FiltrosConteudos,
  ItemCatalogo,
  PlayerConteudo,
} from "../tipos/conteudo";

export function listarCatalogo(filtros: FiltrosConteudos = {}): Promise<Catalogo> {
  return api.obter<Catalogo>("/conteudos", { consulta: filtros });
}

export async function listarCatalogoCompleto(): Promise<ItemCatalogo[]> {
  const primeira = await listarCatalogo();
  const demais = await Promise.all(
    Array.from({ length: Math.max(primeira.total_paginas - 1, 0) }, (_, indice) =>
      listarCatalogo({ page: indice + 2 }),
    ),
  );
  return [primeira, ...demais].flatMap(({ categorias }) =>
    categorias.flatMap(({ itens }) => itens),
  );
}

export function listarCategorias(): Promise<CategoriaConteudo[]> {
  return api.obter<CategoriaConteudo[]>("/conteudo-categorias");
}

const rotaConteudo = (id: string) => `/conteudos/${encodeURIComponent(id)}`;

export function detalharConteudo(id: string): Promise<DetalheConteudo> {
  return api.obter<DetalheConteudo>(rotaConteudo(id));
}

export function abrirPlayer(id: string, publico: boolean): Promise<PlayerConteudo> {
  const caminho = publico
    ? `/conteudos/publicos/${encodeURIComponent(id)}/player`
    : `${rotaConteudo(id)}/player`;
  return api.obter<PlayerConteudo>(caminho);
}

export function marcarVisto(id: string): Promise<void> {
  return api.substituir<void>(`${rotaConteudo(id)}/consumido`);
}

export function desmarcarVisto(id: string): Promise<void> {
  return api.remover<void>(`${rotaConteudo(id)}/consumido`);
}

export function abrirMaterial(id: string): Promise<AcessoMaterial> {
  return api.enviar<AcessoMaterial>(`${rotaConteudo(id)}/acessos`);
}
