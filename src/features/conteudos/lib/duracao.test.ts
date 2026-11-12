import { describe, expect, it } from "vitest";

import { duracaoEmMinutos, duracaoNaCapa } from "./duracao";

describe("duracaoNaCapa", () => {
  it.each([
    [2530, "42:10"],
    [65, "1:05"],
    [3725, "1:02:05"],
  ])("formata %i segundos como %s", (segundos, esperado) => {
    expect(duracaoNaCapa(segundos)).toBe(esperado);
  });
});

describe("duracaoEmMinutos", () => {
  it.each([
    [2530, "42 min"],
    [1185, "19 min"],
    [30, "1 min"],
  ])("formata %i segundos como %s", (segundos, esperado) => {
    expect(duracaoEmMinutos(segundos)).toBe(esperado);
  });
});
