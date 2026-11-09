import { describe, expect, it } from "vitest";

import { IMAGEM_TESTE } from "../mocks/beneficios.handlers";
import { ehPrevia } from "./eh-previa";

describe("ehPrevia", () => {
  it("reconhece a prévia, inclusive sem itens", () => {
    expect(ehPrevia({ total: 1, itens: [{ imagem: IMAGEM_TESTE, bloqueado: true }] })).toBe(true);
    expect(ehPrevia({ total: 0, itens: [] })).toBe(true);
  });

  it("reconhece a lista do Filiado, inclusive sem itens", () => {
    expect(ehPrevia({ total: 0, pagina: 1, total_paginas: 0, itens: [], categorias: [] })).toBe(
      false,
    );
  });
});
