import type { ItemCatalogo, ItemCatalogoCompleto } from "../tipos/conteudo";

export const ITENS_POR_SECAO = 3;

const maisNovoPrimeiro = (a: string | null, b: string | null) => (b ?? "").localeCompare(a ?? "");

export function maisRecentes<T extends ItemCatalogo>(itens: T[]): T[] {
  return [...itens].sort((a, b) => maisNovoPrimeiro(a.data_publicacao, b.data_publicacao));
}

export function conteudosAssistidos(itens: ItemCatalogo[]): ItemCatalogoCompleto[] {
  return itens
    .filter((item): item is ItemCatalogoCompleto => !item.bloqueado && item.consumido)
    .sort((a, b) => maisNovoPrimeiro(a.data_consumo, b.data_consumo));
}
