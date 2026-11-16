import { describe, expect, it } from "vitest";

import { posicaoDoIndice, recortesPorIndice } from "./posicoes-tabuleiro";

describe("posicaoDoIndice", () => {
  it("põe os índices 0 a 3 na linha de cima e 4 a 7 na de baixo", () => {
    expect(posicaoDoIndice(0)).toEqual({ linha: 0, coluna: 0 });
    expect(posicaoDoIndice(3)).toEqual({ linha: 0, coluna: 3 });
    expect(posicaoDoIndice(4)).toEqual({ linha: 1, coluna: 0 });
    expect(posicaoDoIndice(7)).toEqual({ linha: 1, coluna: 3 });
  });

  it("recusa índices fora da grade", () => {
    expect(posicaoDoIndice(-1)).toBeNull();
    expect(posicaoDoIndice(8)).toBeNull();
    expect(posicaoDoIndice(1.5)).toBeNull();
  });
});

describe("recortesPorIndice", () => {
  it("coloca cada recorte na posição do seu índice e ignora índices inválidos", () => {
    const recortes = recortesPorIndice([
      { indice: 4, recorte: "c.png" },
      { indice: 0, recorte: "a.png" },
      { indice: 1, recorte: "b.png" },
      { indice: 9, recorte: "x.png" },
    ]);

    expect(recortes).toEqual(["a.png", "b.png", null, null, "c.png", null, null, null]);
  });
});
