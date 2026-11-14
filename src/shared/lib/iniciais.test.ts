import { describe, expect, it } from "vitest";

import { iniciais } from "./iniciais";

describe("iniciais", () => {
  it.each([
    ["Camila Lopes", "CL"],
    ["maria da silva", "MS"],
    ["Ana", "A"],
    ["  Érica   Souza  ", "ÉS"],
    ["", "?"],
    ["   ", "?"],
  ])("%j vira %j", (nome, esperado) => {
    expect(iniciais(nome)).toBe(esperado);
  });
});
