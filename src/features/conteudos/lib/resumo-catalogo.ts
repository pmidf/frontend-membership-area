import type { ItemCatalogo, ItemCatalogoCompleto } from "../tipos/conteudo";

export const ITENS_POR_SECAO = 3;

export function maisRecentes<T extends ItemCatalogo>(itens: T[]): T[] {
  return [...itens].sort((a, b) =>
    (b.data_publicacao ?? "").localeCompare(a.data_publicacao ?? ""),
  );
}

export function conteudosAssistidos(itens: ItemCatalogo[]): ItemCatalogoCompleto[] {
  return maisRecentes(
    itens.filter((item): item is ItemCatalogoCompleto => !item.bloqueado && item.consumido),
  );
}
