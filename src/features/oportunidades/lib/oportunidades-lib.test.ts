import { describe, expect, it } from "vitest";

import { ehPrevia } from "./eh-previa";
import { filtrosDaUrl, filtrosParaApi } from "./filtros-url";
import { montarMailto } from "./mailto";
import { encerraEmBreve, textoExpiracao, textoPublicacao } from "./prazo";
import { rotulosModalidade } from "./rotulos";

const AGORA = new Date("2026-11-15T15:00:00.000Z");

describe("prazos da vaga", () => {
  it("descreve há quanto tempo a vaga foi publicada", () => {
    expect(textoPublicacao("2026-11-15T12:00:00.000Z", AGORA)).toBe("Publicada hoje");
    expect(textoPublicacao("2026-11-14T12:00:00.000Z", AGORA)).toBe("Publicada ontem");
    expect(textoPublicacao("2026-11-03T12:00:00.000Z", AGORA)).toBe("Publicada há 12 dias");
  });

  it("descreve quando a vaga expira", () => {
    expect(textoExpiracao("2026-11-15", AGORA)).toBe("expira hoje");
    expect(textoExpiracao("2026-11-16", AGORA)).toBe("expira amanhã");
    expect(textoExpiracao("2026-12-15", AGORA)).toBe("expira em 30 dias");
    expect(textoExpiracao(null, AGORA)).toBe("sem prazo");
  });

  it("marca como encerra em breve quando faltam 5 dias ou menos", () => {
    expect(encerraEmBreve("2026-11-15", AGORA)).toBe(true);
    expect(encerraEmBreve("2026-11-18", AGORA)).toBe(true);
    expect(encerraEmBreve("2026-11-20", AGORA)).toBe(true);
    expect(encerraEmBreve("2026-11-21", AGORA)).toBe(false);
    expect(encerraEmBreve("2026-11-14", AGORA)).toBe(false);
    expect(encerraEmBreve(null, AGORA)).toBe(false);
  });
});

describe("mailto da candidatura", () => {
  it("codifica o assunto com acentos, travessão e espaços", () => {
    expect(montarMailto("rh@vega.com.br", "Candidatura — Analista & PMO — via PMI-DF")).toBe(
      "mailto:rh@vega.com.br?subject=Candidatura%20%E2%80%94%20Analista%20%26%20PMO%20%E2%80%94%20via%20PMI-DF",
    );
  });
});

describe("filtros da lista de vagas", () => {
  it("lê a URL descartando modalidade inválida", () => {
    expect(filtrosDaUrl(new URLSearchParams("q=%20pmo%20&modalidade=LUA&pagina=0"))).toEqual({
      q: "pmo",
      modalidade: "",
      ordenar: "recentes",
      pagina: 1,
    });
    expect(filtrosDaUrl(new URLSearchParams("modalidade=REMOTO&pagina=2"))).toEqual({
      q: "",
      modalidade: "REMOTO",
      ordenar: "recentes",
      pagina: 2,
    });
  });

  it("lê a ordem alfabética da URL e trata qualquer outro valor como mais recentes", () => {
    expect(filtrosDaUrl(new URLSearchParams("ordenar=alfabetica")).ordenar).toBe("alfabetica");
    expect(filtrosDaUrl(new URLSearchParams("ordenar=titulo")).ordenar).toBe("recentes");
  });

  it("monta os filtros da API só com o que foi escolhido", () => {
    expect(filtrosParaApi({ q: "", modalidade: "", ordenar: "recentes", pagina: 1 })).toEqual({});
    expect(
      filtrosParaApi({ q: "pmo", modalidade: "HIBRIDO", ordenar: "alfabetica", pagina: 3 }),
    ).toEqual({ q: "pmo", modalidade: "HIBRIDO", ordenar: "alfabetica", page: 3 });
  });
});

describe("prévia e rótulos", () => {
  it("reconhece a prévia pela ausência da paginação", () => {
    expect(ehPrevia({ total: 3, itens: [] })).toBe(true);
    expect(ehPrevia({ total: 0, pagina: 1, total_paginas: 0, itens: [] })).toBe(false);
  });

  it("tem rótulo para toda modalidade", () => {
    expect(rotulosModalidade.HIBRIDO.rotulo).toBe("Híbrido");
    expect(rotulosModalidade.REMOTO.rotulo).toBe("Remoto");
    expect(rotulosModalidade.PRESENCIAL.rotulo).toBe("Presencial");
  });
});
