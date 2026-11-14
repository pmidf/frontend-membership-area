import { describe, expect, it } from "vitest";

import {
  PAGINA_PASSADOS,
  haFiltrosAtivos,
  lerFiltros,
  lerLimite,
  lerMes,
  lerVisao,
} from "./parametros";

describe("lerVisao", () => {
  it.each([
    [{ visao: "calendario" }, "calendario"],
    [{ visao: ["calendario", "lista"] }, "calendario"],
    [{ visao: "outra" }, "lista"],
    [{}, "lista"],
  ])("para %j responde %s", (params, esperado) => {
    expect(lerVisao(params)).toBe(esperado);
  });
});

describe("lerFiltros", () => {
  it("sem parâmetros, usa próximos e nenhum filtro", () => {
    expect(lerFiltros({})).toEqual({
      busca: undefined,
      categoria: undefined,
      formato: undefined,
      periodo: "proximos",
    });
  });

  it("lê os filtros válidos da URL", () => {
    expect(
      lerFiltros({ q: "  gestão ", categoria: "Palestra", formato: "presencial", periodo: "30d" }),
    ).toEqual({ busca: "gestão", categoria: "Palestra", formato: "presencial", periodo: "30d" });
  });

  it("descarta formato e período inválidos e textos vazios", () => {
    expect(lerFiltros({ q: "   ", formato: "hibrido", periodo: "ontem" })).toEqual({
      busca: undefined,
      categoria: undefined,
      formato: undefined,
      periodo: "proximos",
    });
  });
});

describe("lerMes", () => {
  it.each([
    ["2026-11", "2026-11"],
    ["2026-13", undefined],
    ["2026-1", undefined],
    [undefined, undefined],
  ])("para %s responde %s", (mes, esperado) => {
    expect(lerMes({ mes })).toBe(esperado);
  });
});

describe("lerLimite", () => {
  it.each([
    ["40", 40],
    ["9999", 500],
    ["0", PAGINA_PASSADOS],
    ["-5", PAGINA_PASSADOS],
    ["2.5", PAGINA_PASSADOS],
    ["abc", PAGINA_PASSADOS],
    [undefined, PAGINA_PASSADOS],
  ])("para %s responde %s", (limite, esperado) => {
    expect(lerLimite({ limite })).toBe(esperado);
  });
});

describe("haFiltrosAtivos", () => {
  it("sem filtros e com período padrão, não há filtros ativos", () => {
    expect(haFiltrosAtivos({ periodo: "proximos" })).toBe(false);
  });

  it.each([
    { periodo: "proximos" as const, busca: "gestão" },
    { periodo: "proximos" as const, categoria: "Palestra" },
    { periodo: "proximos" as const, formato: "online" as const },
    { periodo: "passados" as const },
  ])("detecta filtro ativo em %j", (filtros) => {
    expect(haFiltrosAtivos(filtros)).toBe(true);
  });
});
