import { afterEach, describe, expect, it, vi } from "vitest";

import { abrirAbaVazia, levarAba } from "./abrir-em-nova-aba";

function abaFalsa() {
  return { opener: {}, location: { href: "" }, close: vi.fn() };
}

afterEach(() => vi.restoreAllMocks());

describe("abrirAbaVazia", () => {
  it("abre a aba no clique e corta o acesso ao opener", () => {
    const aba = abaFalsa();
    const abrir = vi.spyOn(window, "open").mockReturnValue(aba as unknown as Window);

    expect(abrirAbaVazia()).toBe(aba);
    expect(abrir).toHaveBeenCalledWith("", "_blank");
    expect(aba.opener).toBeNull();
  });

  it("devolve null quando o navegador bloqueia a aba", () => {
    vi.spyOn(window, "open").mockReturnValue(null);

    expect(abrirAbaVazia()).toBeNull();
  });
});

describe("levarAba", () => {
  it("leva a aba aberta para o endereço", () => {
    const aba = abaFalsa();

    levarAba(aba as unknown as Window, "https://exemplo.test/a.pdf");

    expect(aba.location.href).toBe("https://exemplo.test/a.pdf");
  });

  it("abre com noopener quando não havia aba", () => {
    const abrir = vi.spyOn(window, "open").mockReturnValue(null);

    levarAba(null, "https://exemplo.test/a.pdf");

    expect(abrir).toHaveBeenCalledWith(
      "https://exemplo.test/a.pdf",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("recusa endereço que não é http ou https", () => {
    expect(() => levarAba(null, "javascript:alert(1)")).toThrow();
  });
});
