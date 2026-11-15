import { describe, expect, it } from "vitest";

import { acoesDaEdicao, acoesDaLinha } from "./acoes-por-situacao";
import { caminhoDaVaga } from "./caminhos";
import { consultaDaLista, filtrosDaUrl, temFiltroAplicado } from "./filtros-url";

describe("ações por situação", () => {
  it("na lista, oferece as ações do Figma para cada status", () => {
    expect(acoesDaLinha("RASCUNHO")).toEqual(["publicar", "duplicar", "editar"]);
    expect(acoesDaLinha("PUBLICADA")).toEqual(["encerrar", "duplicar", "editar"]);
    expect(acoesDaLinha("ENCERRADA")).toEqual(["duplicar"]);
  });

  it("na edição, só a encerrada fica sem salvar", () => {
    expect(acoesDaEdicao("RASCUNHO")).toEqual(["publicar", "previsualizar", "salvar", "duplicar"]);
    expect(acoesDaEdicao("PUBLICADA")).toEqual(["salvar", "previsualizar", "encerrar", "duplicar"]);
    expect(acoesDaEdicao("ENCERRADA")).toEqual(["duplicar"]);
  });

  it("nenhuma situação oferece exclusão", () => {
    const todas = [
      ...acoesDaLinha("RASCUNHO"),
      ...acoesDaLinha("PUBLICADA"),
      ...acoesDaEdicao("PUBLICADA"),
    ];
    expect(todas).not.toContain("excluir");
  });
});

describe("filtros da lista de vagas", () => {
  it("lê a URL descartando situação inválida e página fora do intervalo", () => {
    expect(filtrosDaUrl(new URLSearchParams(`q=%20pmo%20&situacao=ARQUIVADA&pagina=-2`))).toEqual({
      q: "pmo",
      situacao: "",
      pagina: 1,
    });
    expect(filtrosDaUrl(new URLSearchParams("situacao=ENCERRADA&pagina=3"))).toEqual({
      q: "",
      situacao: "ENCERRADA",
      pagina: 3,
    });
  });

  it("limita a busca a 100 caracteres", () => {
    expect(filtrosDaUrl(new URLSearchParams(`q=${"a".repeat(120)}`)).q).toHaveLength(100);
  });

  it("monta a consulta só com o que foi filtrado", () => {
    expect(consultaDaLista({ q: "", situacao: "", pagina: 1 })).toEqual({});
    expect(consultaDaLista({ q: "pmo", situacao: "RASCUNHO", pagina: 2 })).toEqual({
      q: "pmo",
      situacao: "RASCUNHO",
      page: 2,
    });
  });

  it("sabe quando há filtro aplicado", () => {
    expect(temFiltroAplicado({ q: "", situacao: "", pagina: 3 })).toBe(false);
    expect(temFiltroAplicado({ q: "", situacao: "PUBLICADA", pagina: 1 })).toBe(true);
  });

  it("monta o caminho da vaga com a consulta, quando houver", () => {
    expect(caminhoDaVaga("abc")).toBe("/admin/vagas/abc");
    expect(caminhoDaVaga("abc", "situacao=RASCUNHO")).toBe("/admin/vagas/abc?situacao=RASCUNHO");
  });
});
