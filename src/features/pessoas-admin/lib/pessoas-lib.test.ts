import { describe, expect, it } from "vitest";

import { adaptarPagina } from "./adaptar-pagina";
import { rotuloFiliacao, rotulosSituacaoConta } from "./rotulos";

describe("adaptarPagina", () => {
  it.each([
    [45, 20, 3],
    [40, 20, 2],
    [0, 20, 0],
  ])("com total %i e tamanho %i calcula %i páginas", (total, tamanho, totalPaginas) => {
    expect(adaptarPagina({ itens: ["a"], total, pagina: 2, tamanho })).toEqual({
      itens: ["a"],
      total,
      pagina: 2,
      total_paginas: totalPaginas,
    });
  });
});

describe("rótulos", () => {
  it("só considera Filiado a situação aprovada", () => {
    expect(rotuloFiliacao({ situacao: "APROVADO", pmi_id: "1" })).toEqual({
      rotulo: "Filiado",
      tom: "aqua",
    });
    expect(rotuloFiliacao({ situacao: "PENDENTE", pmi_id: "1" }).rotulo).toBe("Não-Filiado");
    expect(rotuloFiliacao(null).rotulo).toBe("Não-Filiado");
  });

  it("descreve a situação da conta", () => {
    expect(rotulosSituacaoConta.ATIVA).toEqual({ rotulo: "Ativa", tom: "aqua" });
    expect(rotulosSituacaoConta.SUSPENSA).toEqual({ rotulo: "Suspensa", tom: "erro" });
  });
});
