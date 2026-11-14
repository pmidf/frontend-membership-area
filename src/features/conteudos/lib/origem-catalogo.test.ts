import { describe, expect, it } from "vitest";

import { caminhoDoConteudo, destinoDeVolta } from "./origem-catalogo";

describe("destinoDeVolta", () => {
  it.each([
    ["/conteudos", "/conteudos"],
    ["/conteudos/biblioteca?tipo=VIDEO&pagina=2", "/conteudos/biblioteca?tipo=VIDEO&pagina=2"],
    ["/conteudos/historico", "/conteudos/historico"],
    [null, "/conteudos"],
    ["https://malicioso.test/conteudos", "/conteudos"],
    ["//malicioso.test/conteudos", "/conteudos"],
    ["/conteudosfalsos", "/conteudos"],
    ["/beneficios", "/conteudos"],
  ])("para %s volta para %s", (origem, esperado) => {
    expect(destinoDeVolta(origem)).toBe(esperado);
  });
});

describe("caminhoDoConteudo", () => {
  it("leva a origem codificada no parâmetro de", () => {
    expect(caminhoDoConteudo("abc", "/conteudos/biblioteca?tipo=VIDEO")).toBe(
      "/conteudos/abc?de=%2Fconteudos%2Fbiblioteca%3Ftipo%3DVIDEO",
    );
  });
});
