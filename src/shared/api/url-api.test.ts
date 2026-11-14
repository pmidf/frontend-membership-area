import { describe, expect, it } from "vitest";

import { urlApi } from "./url-api";

describe("urlApi", () => {
  it("monta a URL da raiz da API na origem atual", () => {
    expect(urlApi()).toBe(`${window.location.origin}/api`);
  });

  it("acrescenta o caminho informado ao prefixo da API", () => {
    expect(urlApi("/beneficios")).toBe(`${window.location.origin}/api/beneficios`);
  });
});
