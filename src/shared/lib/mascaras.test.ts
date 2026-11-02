import { describe, expect, it } from "vitest";

import { mascararCep, mascararTelefone, somenteDigitos } from "./mascaras";

describe("máscaras", () => {
  it("remove tudo que não é dígito", () => {
    expect(somenteDigitos("(61) 9 9123-4567")).toBe("61991234567");
  });

  it.each([
    ["", ""],
    ["6", "(6"],
    ["619", "(61) 9"],
    ["61991", "(61) 991"],
    ["6133214", "(61) 3321-4"],
    ["6133214567", "(61) 3321-4567"],
    ["61991234567", "(61) 9 9123-4567"],
    ["619912345678", "(61) 9 9123-4567"],
  ])("formata o telefone %s como %s", (entrada, saida) => {
    expect(mascararTelefone(entrada)).toBe(saida);
  });

  it.each([
    ["7004", "7004"],
    ["700400", "70040-0"],
    ["70040-010", "70040-010"],
    ["700400109", "70040-010"],
  ])("formata o CEP %s como %s", (entrada, saida) => {
    expect(mascararCep(entrada)).toBe(saida);
  });
});
