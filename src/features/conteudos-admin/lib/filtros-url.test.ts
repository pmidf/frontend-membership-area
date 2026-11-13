import { describe, expect, it } from "vitest";

import { consultaDaLista, filtrosDaUrl, temFiltroAplicado } from "./filtros-url";

const ID_CATEGORIA = "50000000-0000-4000-8000-000000000001";

describe("filtros da biblioteca do Admin", () => {
  it("lê a situação e os filtros do catálogo", () => {
    const filtros = filtrosDaUrl(
      new URLSearchParams(`situacao=RASCUNHO&tipo=VIDEO&categoria=${ID_CATEGORIA}&q=ia&pagina=2`),
    );

    expect(filtros).toEqual({
      situacao: "RASCUNHO",
      tipo: "VIDEO",
      categoria: ID_CATEGORIA,
      q: "ia",
      pagina: 2,
    });
    expect(consultaDaLista(filtros)).toEqual({
      situacao: "RASCUNHO",
      tipo: "VIDEO",
      categoria: ID_CATEGORIA,
      q: "ia",
      page: 2,
    });
    expect(temFiltroAplicado(filtros)).toBe(true);
  });

  it("ignora situação desconhecida e não envia filtros vazios", () => {
    const filtros = filtrosDaUrl(new URLSearchParams("situacao=EXCLUIDO&pagina=1"));

    expect(filtros.situacao).toBe("");
    expect(consultaDaLista(filtros)).toEqual({});
    expect(temFiltroAplicado(filtros)).toBe(false);
  });
});
