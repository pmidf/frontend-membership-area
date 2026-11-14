import { describe, expect, it } from "vitest";

import type { Evento } from "../types";
import { gerarIcs, localDoEvento } from "./ics";

const agora = new Date("2026-11-14T12:00:00.000Z");

function evento(dados: Partial<Evento> = {}): Evento {
  return {
    id: "42",
    titulo: "Encontro; gestão, riscos",
    descricao: "Primeira linha\nSegunda linha",
    inicio: "2026-11-20T22:00:00.000Z",
    fim: "2026-11-20T23:30:00.000Z",
    urlSympla: "https://www.sympla.com.br/evento/42",
    endereco: null,
    categoria: "Palestra",
    cancelado: false,
    ...dados,
  };
}

describe("localDoEvento", () => {
  it("evento sem endereço é online", () => {
    expect(localDoEvento(evento())).toBe("Online");
  });

  it("monta o endereço completo", () => {
    expect(
      localDoEvento(
        evento({
          endereco: {
            nome: "Impact Hub",
            logradouro: "SGAN 601",
            bairro: "Asa Norte",
            cidade: "Brasília",
            uf: "DF",
          },
        }),
      ),
    ).toBe("Impact Hub, SGAN 601, Asa Norte, Brasília/DF");
  });

  it("omite o bairro quando ausente", () => {
    expect(
      localDoEvento(
        evento({
          endereco: { nome: "Impact Hub", logradouro: "SGAN 601", cidade: "Brasília", uf: "DF" },
        }),
      ),
    ).toBe("Impact Hub, SGAN 601, Brasília/DF");
  });
});

describe("gerarIcs", () => {
  it("gera o calendário com datas em UTC e texto escapado", () => {
    const ics = gerarIcs(evento(), agora);
    const linhas = ics.split("\r\n");

    expect(ics.endsWith("\r\n")).toBe(true);
    expect(linhas[0]).toBe("BEGIN:VCALENDAR");
    expect(linhas).toContain("UID:evento-42@membros.pmidf.org");
    expect(linhas).toContain("DTSTAMP:20261114T120000Z");
    expect(linhas).toContain("DTSTART:20261120T220000Z");
    expect(linhas).toContain("DTEND:20261120T233000Z");
    expect(linhas).toContain("SUMMARY:Encontro\\; gestão\\, riscos");
    expect(linhas).toContain("LOCATION:Online");
    expect(linhas).toContain("STATUS:CONFIRMED");
    expect(ics).toContain("Primeira linha\\nSegunda linha");
  });

  it("marca evento cancelado e escapa barras invertidas", () => {
    const ics = gerarIcs(evento({ cancelado: true, titulo: "A\\B" }), agora);
    expect(ics).toContain("STATUS:CANCELLED");
    expect(ics).toContain("SUMMARY:A\\\\B");
  });

  it("dobra linhas com mais de 75 octetos sem partir caracteres multibyte", () => {
    const ics = gerarIcs(evento({ titulo: "ç".repeat(100) }), agora);
    const linhas = ics.split("\r\n").filter((l) => l.length > 0);

    for (const linha of linhas) {
      expect(Buffer.byteLength(linha, "utf8")).toBeLessThanOrEqual(75);
    }
    const resumo = ics.slice(ics.indexOf("SUMMARY:"), ics.indexOf("\r\nDESCRIPTION:"));
    expect(resumo.replace(/\r\n /g, "")).toBe(`SUMMARY:${"ç".repeat(100)}`);
  });

  it("usa a data atual quando não recebe referência", () => {
    expect(gerarIcs(evento())).toMatch(/DTSTAMP:\d{8}T\d{6}Z/);
  });
});
