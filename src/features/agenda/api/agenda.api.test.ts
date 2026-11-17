import { http, HttpResponse } from "msw/http";
import { describe, expect, it } from "vitest";

import { servidor } from "@/test/servidor";

import type { SituacaoNoEvento } from "../types";
import { consultarSituacao, EVENTOS_POR_CONSULTA, listarEventosAgenda } from "./agenda.api";
import { eventosTeste, handlersAgenda } from "../mocks/agenda.handlers";

describe("agenda.api", () => {
  it("lista os eventos públicos da agenda", async () => {
    servidor.use(...handlersAgenda());

    await expect(listarEventosAgenda()).resolves.toEqual(eventosTeste);
  });

  it("consulta a situação em lotes de 50, enviando só os ids", async () => {
    const corpos: unknown[] = [];
    servidor.use(
      http.post("*/api/agenda/participacoes/situacao", async ({ request }) => {
        const corpo = (await request.json()) as { eventoIds: string[] };
        corpos.push(corpo);
        return HttpResponse.json(
          corpo.eventoIds.map((eventoId): SituacaoNoEvento => ({ eventoId, status: "presente" })),
        );
      }),
    );
    const ids = Array.from({ length: 120 }, (_, indice) => String(indice));

    const situacoes = await consultarSituacao(ids);

    expect(corpos).toEqual([
      { eventoIds: ids.slice(0, EVENTOS_POR_CONSULTA) },
      { eventoIds: ids.slice(50, 100) },
      { eventoIds: ids.slice(100) },
    ]);
    expect(situacoes.map(({ eventoId }) => eventoId)).toEqual(ids);
  });
});
