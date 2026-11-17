import { api } from "@/shared/api/cliente-http";

import type { Evento, SituacaoNoEvento } from "../types";

export const EVENTOS_POR_CONSULTA = 50;

export function listarEventosAgenda(): Promise<Evento[]> {
  return api.obter<Evento[]>("/agenda/eventos");
}

function emLotes<T>(itens: T[], tamanho: number): T[][] {
  return Array.from({ length: Math.ceil(itens.length / tamanho) }, (_, indice) =>
    itens.slice(indice * tamanho, (indice + 1) * tamanho),
  );
}

export async function consultarSituacao(eventoIds: string[]): Promise<SituacaoNoEvento[]> {
  const respostas = await Promise.all(
    emLotes(eventoIds, EVENTOS_POR_CONSULTA).map((lote) =>
      api.enviar<SituacaoNoEvento[]>("/agenda/participacoes/situacao", { eventoIds: lote }),
    ),
  );
  return respostas.flat();
}
