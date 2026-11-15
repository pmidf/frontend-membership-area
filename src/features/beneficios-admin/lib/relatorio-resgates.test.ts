import { describe, expect, it } from "vitest";

import { anoAtual, anosDoRelatorio } from "./relatorio-resgates";

describe("anos do relatório de resgates", () => {
  it("o ano só vira à meia-noite de Brasília", () => {
    expect(anoAtual(new Date("2027-01-01T02:59:00Z"))).toBe(2026);
    expect(anoAtual(new Date("2027-01-01T03:00:00Z"))).toBe(2027);
  });

  it("lista do ano atual até 2020", () => {
    expect(anosDoRelatorio(new Date("2023-06-01T12:00:00Z"))).toEqual([2023, 2022, 2021, 2020]);
  });
});
