import type { ItemCatalogo, ItemCatalogoCompleto } from "../tipos/conteudo";

export function legendaProgresso(vistos: number, total: number): string {
  if (total > 0 && vistos >= total) return `Concluída · ${total} de ${total}`;
  if (vistos === 0) return `Não iniciada · 0 de ${total}`;
  return `${vistos} de ${total} concluídos`;
}

export function proximoDaTrilha(itens: ItemCatalogo[]): ItemCatalogoCompleto | undefined {
  return itens.find((item): item is ItemCatalogoCompleto => !item.bloqueado && !item.consumido);
}
