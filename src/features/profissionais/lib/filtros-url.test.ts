import { describe, expect, it } from "vitest";

import { filtrosDaUrl, filtrosParaApi } from "./filtros-url";

describe("filtros da vitrine de profissionais", () => {
  it("lê a URL aparando textos, normalizando a UF e corrigindo a página", () => {
    expect(
      filtrosDaUrl(new URLSearchParams("q=%20pmo%20&uf=df&cidade=%20Bras%C3%ADlia%20&pagina=0")),
    ).toEqual({ q: "pmo", uf: "DF", cidade: "Brasília", pagina: 1 });
  });

  it("descarta UF inexistente e limita os textos a 100 caracteres", () => {
    const longo = "a".repeat(150);
    expect(filtrosDaUrl(new URLSearchParams(`uf=XX&q=${longo}&cidade=${longo}`))).toEqual({
      q: "a".repeat(100),
      uf: "",
      cidade: "a".repeat(100),
      pagina: 1,
    });
  });

  it("manda para a API só os filtros preenchidos, com a página como page", () => {
    expect(filtrosParaApi({ q: "", uf: "", cidade: "", pagina: 1 })).toEqual({});
    expect(filtrosParaApi({ q: "pmo", uf: "DF", cidade: "Brasília", pagina: 3 })).toEqual({
      q: "pmo",
      uf: "DF",
      cidade: "Brasília",
      page: 3,
    });
  });
});
