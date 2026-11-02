import { describe, expect, it } from "vitest";

import { diasAte, formatarDiaMes, formatarMesAno, hojeNoFuso } from "./datas";

describe("datas", () => {
  it("formata a data civil do backend sem deslocar pelo fuso", () => {
    expect(formatarMesAno("2027-03-31T00:00:00.000Z")).toBe("03/2027");
    expect(formatarMesAno("2027-04-01")).toBe("04/2027");
    expect(formatarDiaMes("2027-04-01T00:00:00.000Z")).toBe("01/04");
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
