import { describe, expect, it } from "vitest";

import { paginaDaUrl } from "@/shared/lib/pagina-da-url";

import { filtrosDaUrl, filtrosParaApi } from "./filtros-url";
import { rotulosCategoria, rotulosTipoResgate } from "./rotulos-beneficio";
import { situacaoValidade } from "./situacao-validade";

describe("situacaoValidade", () => {
  const agora = new Date("2026-11-08T15:00:00.000Z");

  it.each([
    [null, "Sem data de término", false],
    ["2026-11-30", "Válido até 30/11/2026", false],
    ["2026-11-16", "Válido até 16/11/2026", false],
    ["2026-11-15", "Termina em 7 dias", true],
    ["2026-11-13", "Termina em 5 dias", true],
    ["2026-11-09", "Termina em 1 dia", true],
    ["2026-11-08", "Termina hoje", true],
  ])("com fim %s mostra %s", (fim, texto, urgente) => {
    expect(situacaoValidade(fim, agora)).toEqual({ texto, urgente });
  });
});

describe("filtrosDaUrl", () => {
  it("lê busca, categoria e página", () => {
    expect(filtrosDaUrl(new URLSearchParams("q= PMP &categoria=EDUCACAO&pagina=3"))).toEqual({
      q: "PMP",
      categoria: "EDUCACAO",
      pagina: 3,
    });
  });

  it("descarta categoria inválida e limita a busca", () => {
    const filtros = filtrosDaUrl(new URLSearchParams(`categoria=X&q=${"a".repeat(120)}`));

    expect(filtros.categoria).toBe("");
    expect(filtros.q).toHaveLength(100);
  });
});

describe("filtrosParaApi", () => {
  it("omite o que está vazio, para compartilhar a consulta sem filtros", () => {
    expect(filtrosParaApi({ q: "", categoria: "", pagina: 1 })).toEqual({});
  });

  it("usa page na API", () => {
    expect(filtrosParaApi({ q: "pmp", categoria: "EVENTOS", pagina: 2 })).toEqual({
      q: "pmp",
      categoria: "EVENTOS",
      page: 2,
    });
  });
});

describe("paginaDaUrl", () => {
  it.each([
    [null, 1],
    ["abc", 1],
    ["0", 1],
    ["-2", 1],
    ["1.5", 1],
    ["4", 4],
  ])("com %s devolve %i", (valor, pagina) => {
    expect(paginaDaUrl(valor)).toBe(pagina);
  });
});

describe("rótulos", () => {
  it("nomeia categorias e formas de resgate", () => {
    expect(rotulosCategoria.CERTIFICACAO.rotulo).toBe("Certificação");
    expect(rotulosTipoResgate).toEqual({
      CUPOM: "Cupom compartilhado",
      INSTRUCAO: "Instrução do parceiro",
    });
  });
});
