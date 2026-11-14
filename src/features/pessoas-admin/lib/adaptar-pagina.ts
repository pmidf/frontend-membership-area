import type { Pagina } from "@/shared/api/tipos";

import type { RespostaPaginada } from "../api/pessoas-admin.api";

export function adaptarPagina<T>({
  itens,
  total,
  pagina,
  tamanho,
}: RespostaPaginada<T>): Pagina<T> {
  return { itens, total, pagina, total_paginas: Math.ceil(total / tamanho) };
}
