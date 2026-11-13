import { describe, expect, it } from "vitest";

import { agruparSerie } from "./agrupar-serie";
import { erroDoPeriodo, periodoDaUrl } from "./periodo-estatisticas";

const AGORA = new Date("2026-11-12T15:00:00.000Z");
const dias = (quantidade: number) =>
  Array.from({ length: quantidade }, (_, indice) => ({
    dia: new Date(Date.UTC(2026, 0, 1 + indice)).toISOString().slice(0, 10),
    visualizacoes: 1,
  }));

describe("agruparSerie", () => {
  it("mantém um ponto por dia até 60 dias", () => {
    const { porSemana, barras } = agruparSerie(dias(60));

    expect(porSemana).toBe(false);
    expect(barras).toHaveLength(60);
    expect(barras[0]).toEqual({
      chave: "2026-01-01",
      rotulo: "01/01/2026",
      rotuloEixo: "01/01",
      valor: 1,
    });
  });

  it("soma por semana acima de 60 dias, com a última semana parcial", () => {
    const { porSemana, barras } = agruparSerie(dias(65));

    expect(porSemana).toBe(true);
    expect(barras).toHaveLength(10);
    expect(barras[0]).toEqual({
      chave: "2026-01-01",
      rotulo: "01/01 a 07/01/2026",
      rotuloEixo: "01/01",
      valor: 7,
    });
    expect(barras[9]).toMatchObject({ rotulo: "05/03 a 06/03/2026", valor: 2 });
  });
});

describe("período das estatísticas", () => {
  it("usa os últimos 30 dias sem datas na URL", () => {
    expect(periodoDaUrl(new URLSearchParams(), AGORA)).toEqual({
      periodo: { de: "2026-10-14", ate: "2026-11-12" },
      consulta: {},
    });
  });

  it("lê um período válido da URL", () => {
    expect(periodoDaUrl(new URLSearchParams("de=2026-08-01&ate=2026-10-31"), AGORA)).toEqual({
      periodo: { de: "2026-08-01", ate: "2026-10-31" },
      consulta: { de: "2026-08-01", ate: "2026-10-31" },
    });
  });

  it("ignora um período inválido da URL", () => {
    expect(
      periodoDaUrl(new URLSearchParams("de=2026-11-10&ate=2026-11-01"), AGORA).consulta,
    ).toEqual({});
  });

  it.each([
    [{ de: "", ate: "2026-11-01" }, "Informe as duas datas"],
    [{ de: "2026-11-10", ate: "2026-11-01" }, "A data inicial deve ser anterior ou igual à final"],
    [{ de: "2025-01-01", ate: "2026-01-02" }, "O período pode ter no máximo 366 dias"],
    [{ de: "2025-01-01", ate: "2026-01-01" }, undefined],
  ])("valida %o", (periodo, erro) => {
    expect(erroDoPeriodo(periodo)).toBe(erro);
  });
});
