import { seloData } from "@/features/agenda/lib/datas";
import { formatoDoEvento, jaAconteceu, rotuloFormato } from "@/features/agenda/lib/regras";
import type { Evento, SituacaoNoEvento } from "@/features/agenda/types";
import { ITENS_POR_SECAO, maisRecentes } from "@/features/conteudos/lib/resumo-catalogo";
import type { ItemCatalogo, ItemCatalogoPrevia } from "@/features/conteudos/tipos/conteudo";

export const DESTAQUES_POR_SECAO = ITENS_POR_SECAO;

export function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0];
}

const peloInicio = (a: Evento, b: Evento) =>
  new Date(a.inicio).getTime() - new Date(b.inicio).getTime();

export function proximosEventos(eventos: Evento[], agora: Date): Evento[] {
  return eventos
    .filter((evento) => !evento.cancelado && !jaAconteceu(evento, agora))
    .sort(peloInicio)
    .slice(0, DESTAQUES_POR_SECAO);
}

export function idsDeEventosPassados(eventos: Evento[], agora: Date): string[] {
  return eventos
    .filter((evento) => !evento.cancelado && jaAconteceu(evento, agora))
    .map(({ id }) => id);
}

export function contarPresencas(situacoes: SituacaoNoEvento[]): number {
  return situacoes.filter(({ status }) => status === "presente").length;
}

export function rotuloEvento(evento: Evento): string {
  const { dia, mes, ano } = seloData(evento.inicio);
  const partes = [`${dia} ${mes} ${ano}`, rotuloFormato(formatoDoEvento(evento))];
  if (evento.endereco?.cidade) partes.push(evento.endereco.cidade);
  return partes.join(" · ");
}

export function conteudosRecentes<T extends ItemCatalogo>(itens: T[]): T[] {
  return maisRecentes(itens).slice(0, DESTAQUES_POR_SECAO);
}

export function conteudosBloqueadosRecentes(itens: ItemCatalogo[]): ItemCatalogoPrevia[] {
  return conteudosRecentes(itens.filter((item): item is ItemCatalogoPrevia => item.bloqueado));
}
