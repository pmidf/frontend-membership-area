import { describe, expect, it } from "vitest";

import {
  consultaDaLista,
  filtrosDaUrl,
  filtrosDeExportacao,
  temFiltroAplicado,
} from "./filtros-url";
import { textoVigencia } from "./rotulos";

const parametros = (consulta: string) => new URLSearchParams(consulta);

describe("filtrosDaUrl", () => {
  it("lê todos os filtros válidos", () => {
    expect(
      filtrosDaUrl(
        parametros(
          "q=pmp&situacao=ARQUIVADO&tipo_resgate=CUPOM&categoria=EVENTOS&vigencia=FUTURA&ordenar=resgates_asc&pagina=2",
        ),
      ),
    ).toEqual({
      q: "pmp",
      situacao: "ARQUIVADO",
      tipo_resgate: "CUPOM",
      categoria: "EVENTOS",
      vigencia: "FUTURA",
      ordenar: "resgates_asc",
      pagina: 2,
    });
  });

  it("descarta valores inválidos", () => {
    expect(
      filtrosDaUrl(
        parametros("situacao=X&tipo_resgate=Y&categoria=Z&vigencia=W&ordenar=K&pagina=a"),
      ),
    ).toEqual({
      q: "",
      situacao: "",
      tipo_resgate: "",
      categoria: "",
      vigencia: "",
      ordenar: "",
      pagina: 1,
    });
  });
});

describe("consultas à API", () => {
  const filtros = filtrosDaUrl(
    parametros("q=pmp&situacao=PUBLICADO&ordenar=resgates_desc&pagina=3"),
  );

  it("usa page e ordenar na lista", () => {
    expect(consultaDaLista(filtros)).toEqual({
      q: "pmp",
      situacao: "PUBLICADO",
      ordenar: "resgates_desc",
      page: 3,
    });
  });

  it("não envia ordenar nem page na exportação, que recusa campos extras", () => {
    expect(filtrosDeExportacao(filtros)).toEqual({ q: "pmp", situacao: "PUBLICADO" });
  });

  it("não considera ordenação e página como filtro aplicado", () => {
    expect(temFiltroAplicado(filtrosDaUrl(parametros("ordenar=resgates_asc&pagina=2")))).toBe(
      false,
    );
    expect(temFiltroAplicado(filtros)).toBe(true);
  });
});

describe("rótulos", () => {
  it("descreve a vigência", () => {
    expect(textoVigencia({ vigencia_inicio: "2026-01-01", vigencia_fim: "2026-12-31" })).toBe(
      "01/01 a 31/12/2026",
    );
    expect(textoVigencia({ vigencia_inicio: "2026-01-01", vigencia_fim: null })).toBe(
      "Sem data de término",
    );
  });
});
