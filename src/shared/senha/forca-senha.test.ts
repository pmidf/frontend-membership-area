import { describe, expect, it } from "vitest";

import { classificarForcaSenha } from "./forca-senha";

describe("classificarForcaSenha", () => {
  it.each([
    ["", null],
    ["Ab1!", "fraca"],
    ["aaaaaaaaaaaa", "fraca"],
    ["senhalonga1", "media"],
    ["Senhalonga1", "media"],
    ["SenhaForte2026!", "forte"],
    ["senha-forte-2026", "forte"],
  ])("classifica %j como %s", (senha, forca) => {
    expect(classificarForcaSenha(senha)).toBe(forca);
  });
});
