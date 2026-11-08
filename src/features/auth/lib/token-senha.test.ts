import { describe, expect, it } from "vitest";

import { normalizarToken } from "./token-senha";

describe("normalizarToken", () => {
  it("remove a pontuação que o leitor de e-mail cola no fim do link", () => {
    expect(normalizarToken("dcxGF_0x-Ab9.")).toBe("dcxGF_0x-Ab9");
    expect(normalizarToken("dcxGF_0x-Ab9).")).toBe("dcxGF_0x-Ab9");
    expect(normalizarToken(" dcxGF_0x-Ab9 ")).toBe("dcxGF_0x-Ab9");
  });

  it("mantém o token íntegro e trata a ausência", () => {
    expect(normalizarToken("dcxGF_0x-Ab9")).toBe("dcxGF_0x-Ab9");
    expect(normalizarToken(null)).toBe("");
  });
});
