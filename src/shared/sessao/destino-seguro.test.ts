import { describe, expect, it } from "vitest";

import { caminhoDeLogin, destinoSeguro } from "./destino-seguro";

describe("destinoSeguro", () => {
  it.each([
    ["/beneficios?q=pmp", "/beneficios?q=pmp"],
    [null, "/inicio"],
    ["", "/inicio"],
    ["https://site-externo.com", "/inicio"],
    ["//site-externo.com", "/inicio"],
    ["/\\site-externo.com", "/inicio"],
  ])("%j vira %j", (destino, esperado) => {
    expect(destinoSeguro(destino)).toBe(esperado);
  });

  it("codifica o destino no caminho de login", () => {
    expect(caminhoDeLogin("/perfil?aba=seguranca")).toBe(
      "/login?redirecionar=%2Fperfil%3Faba%3Dseguranca",
    );
  });
});
