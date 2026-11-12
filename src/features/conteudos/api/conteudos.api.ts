import { api } from "@/shared/api/cliente-http";

import type {
  Catalogo,
  CategoriaConteudo,
  FiltrosConteudos,
  ItemCatalogo,
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
