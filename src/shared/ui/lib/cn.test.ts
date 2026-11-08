import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("junta classes condicionais e resolve conflitos do Tailwind", () => {
    const ativo = false;
    expect(cn("px-4 text-corpo", ativo && "hidden", "px-6")).toBe("text-corpo px-6");
  });

  it("mantém tamanho de fonte e cor de texto do tema juntos", () => {
    expect(cn("text-texto-inverso", "text-botao")).toBe("text-texto-inverso text-botao");
    expect(cn("text-corpo", "text-legenda")).toBe("text-legenda");
  });

  it("reconhece o raio pill do tema", () => {
    expect(cn("rounded-md", "rounded-pill")).toBe("rounded-pill");
  });
});
