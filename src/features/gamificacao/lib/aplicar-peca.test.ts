import { describe, expect, it } from "vitest";

import type { PainelGamificacao } from "../tipos/gamificacao";
import { aplicarPeca } from "./aplicar-peca";

const painel: PainelGamificacao = {
  creditos: 2,
  em_andamento: {
    pecas_obtidas: 2,
    total_pecas: 8,
    pecas: [
      { indice: 0, recorte: "a.png" },
      { indice: 4, recorte: "e.png" },
    ],
  },
  concluidos: [],
};

describe("aplicarPeca", () => {
  it("soma a peça na ordem dos índices e atualiza o progresso e os créditos", () => {
    const resultado = aplicarPeca(painel, {
      indice: 2,
      recorte: "c.png",
      pecas_obtidas: 3,
      creditos: 1,
    });

    expect(resultado.creditos).toBe(1);
    expect(resultado.em_andamento?.pecas_obtidas).toBe(3);
    expect(resultado.em_andamento?.pecas.map(({ indice }) => indice)).toEqual([0, 2, 4]);
    expect(painel.em_andamento?.pecas).toHaveLength(2);
  });

  it("não duplica uma peça que já estava no tabuleiro", () => {
    const resultado = aplicarPeca(painel, {
      indice: 4,
      recorte: "e.png",
      pecas_obtidas: 2,
      creditos: 2,
    });

    expect(resultado.em_andamento?.pecas).toHaveLength(2);
  });

  it("só atualiza os créditos quando não há quebra-cabeça em andamento", () => {
    const resultado = aplicarPeca(
      { ...painel, em_andamento: null },
      { indice: 1, recorte: "b.png", pecas_obtidas: 1, creditos: 0 },
    );

    expect(resultado).toEqual({ ...painel, em_andamento: null, creditos: 0 });
  });
});
