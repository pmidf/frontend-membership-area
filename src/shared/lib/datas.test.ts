import { describe, expect, it } from "vitest";

import {
  diasAte,
  formatarDataCivil,
  formatarDataHora,
  formatarDataHoraOuHoje,
  formatarDiaMes,
  formatarMesAno,
  hojeNoFuso,
  tempoDesde,
  tempoRelativo,
} from "./datas";

describe("datas", () => {
  it("formata a data civil do backend sem deslocar pelo fuso", () => {
    expect(formatarMesAno("2027-03-31T00:00:00.000Z")).toBe("03/2027");
    expect(formatarMesAno("2027-04-01")).toBe("04/2027");
    expect(formatarDiaMes("2027-04-01T00:00:00.000Z")).toBe("01/04");
    expect(formatarDataCivil("2027-04-01T00:00:00.000Z")).toBe("01/04/2027");
  });

  it("considera o dia de hoje em America/Sao_Paulo", () => {
    expect(hojeNoFuso(new Date("2026-11-02T02:30:00.000Z"))).toBe("2026-11-01");
    expect(hojeNoFuso(new Date("2026-11-02T03:00:00.000Z"))).toBe("2026-11-02");
  });

  it("conta os dias até a data civil a partir de hoje no fuso", () => {
    const noiteEmBrasilia = new Date("2026-11-02T02:30:00.000Z");

    expect(diasAte("2026-11-21T00:00:00.000Z", noiteEmBrasilia)).toBe(20);
    expect(diasAte("2026-11-01", noiteEmBrasilia)).toBe(0);
    expect(diasAte("2026-10-31", noiteEmBrasilia)).toBe(-1);
  });
});

describe("tempoRelativo e formatarDataHora", () => {
  const agora = new Date("2026-11-02T15:00:00.000Z");

  it.each([
    ["2026-11-02T14:59:40.000Z", "agora mesmo"],
    ["2026-11-02T14:55:00.000Z", "há 5 minutos"],
    ["2026-11-02T13:00:00.000Z", "há 2 horas"],
    ["2026-11-01T15:00:00.000Z", "ontem"],
    ["2026-10-30T15:00:00.000Z", "há 3 dias"],
    ["2026-09-01T15:00:00.000Z", "há 2 meses"],
    ["2025-10-01T15:00:00.000Z", "ano passado"],
  ])("descreve %s como %s", (instante, texto) => {
    expect(tempoRelativo(instante, agora)).toBe(texto);
  });

  it("trata um instante passado no futuro, por diferença de relógio, como agora", () => {
    expect(tempoDesde("2026-11-02T17:00:00.000Z", agora)).toBe("agora mesmo");
    expect(tempoDesde("2026-11-02T13:00:00.000Z", agora)).toBe("há 2 horas");
    expect(tempoRelativo("2026-11-05T15:00:00.000Z", agora)).toBe("em 3 dias");
  });

  it("formata data e hora no fuso de Brasília", () => {
    expect(formatarDataHora("2026-11-02T02:30:00.000Z")).toBe("01/11/2026 às 23:30");
  });

  it("diz Hoje quando o instante cai no dia atual em Brasília", () => {
    expect(formatarDataHoraOuHoje("2026-11-02T11:14:00.000Z", agora)).toBe("Hoje às 08:14");
    expect(formatarDataHoraOuHoje("2026-11-02T02:30:00.000Z", agora)).toBe("01/11/2026 às 23:30");
  });
});
