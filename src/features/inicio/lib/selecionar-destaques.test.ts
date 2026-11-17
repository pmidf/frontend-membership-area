import { describe, expect, it } from "vitest";

import type { Evento } from "@/features/agenda/types";
import {
  itemBloqueado,
  materialNovo,
  videoVisto,
} from "@/features/conteudos/mocks/conteudos.handlers";

import {
  contarPresencas,
  conteudosBloqueadosRecentes,
  conteudosRecentes,
  idsDeEventosPassados,
  primeiroNome,
  proximosEventos,
  rotuloEvento,
} from "./selecionar-destaques";

const agora = new Date("2026-11-16T12:00:00-03:00");

function evento(id: string, inicio: string, extras: Partial<Evento> = {}): Evento {
  return {
    id,
    titulo: `Evento ${id}`,
    descricao: "",
    inicio,
    fim: new Date(new Date(inicio).getTime() + 7_200_000).toISOString(),
    urlSympla: "https://www.sympla.com.br/evento/teste",
    endereco: null,
    categoria: "Encontro",
    cancelado: false,
    ...extras,
  };
}

const eventos = [
  evento("dezembro", "2026-12-10T19:00:00-03:00"),
  evento("cancelado", "2026-11-20T19:00:00-03:00", { cancelado: true }),
  evento("amanha", "2026-11-17T19:00:00-03:00"),
  evento("janeiro", "2027-01-15T19:00:00-03:00"),
  evento("fevereiro", "2027-02-15T19:00:00-03:00"),
  evento("em-andamento", "2026-11-16T11:00:00-03:00"),
  evento("passado", "2026-10-01T19:00:00-03:00"),
  evento("passado-cancelado", "2026-09-01T19:00:00-03:00", { cancelado: true }),
];

describe("primeiroNome", () => {
  it("pega a primeira palavra, ignorando espaços extras", () => {
    expect(primeiroNome("  Maria   Souza ")).toBe("Maria");
    expect(primeiroNome("Rafael")).toBe("Rafael");
  });
});

describe("proximosEventos", () => {
  it("deixa de fora cancelados e encerrados, ordena pelo início e fica com 3", () => {
    expect(proximosEventos(eventos, agora).map(({ id }) => id)).toEqual([
      "em-andamento",
      "amanha",
      "dezembro",
    ]);
  });

  it("devolve lista vazia quando não há eventos futuros", () => {
    expect(proximosEventos([eventos[6]], agora)).toEqual([]);
  });
});

describe("idsDeEventosPassados", () => {
  it("considera só os encerrados que não foram cancelados", () => {
    expect(idsDeEventosPassados(eventos, agora)).toEqual(["passado"]);
  });
});

describe("contarPresencas", () => {
  it("conta só as situações de presença", () => {
    expect(
      contarPresencas([
        { eventoId: "1", status: "presente" },
        { eventoId: "2", status: "ausente" },
        { eventoId: "3", status: "inscrito" },
        { eventoId: "4", status: "presente" },
      ]),
    ).toBe(2);
  });
});

describe("rotuloEvento", () => {
  it("mostra data no fuso de Brasília, formato e cidade do presencial", () => {
    const presencial = evento("p", "2026-11-29T22:30:00-03:00", {
      endereco: { nome: "Impact Hub", logradouro: "SGAN 601", cidade: "Brasília", uf: "DF" },
    });

    expect(rotuloEvento(presencial)).toBe("29 NOV 2026 · Presencial · Brasília");
  });

  it("mostra só data e formato do evento online", () => {
    expect(rotuloEvento(evento("o", "2027-01-05T10:00:00-03:00"))).toBe("05 JAN 2027 · Online");
  });
});

describe("conteúdos recentes", () => {
  const antigo = { ...videoVisto, id_conteudo: "antigo", data_publicacao: "2025-01-01T00:00:00Z" };
  const semData = { ...videoVisto, id_conteudo: "sem-data", data_publicacao: null };
  const itens = [antigo, semData, itemBloqueado, videoVisto, materialNovo];

  it("pega os 3 publicados mais recentemente", () => {
    expect(conteudosRecentes(itens).map(({ id_conteudo }) => id_conteudo)).toEqual([
      itemBloqueado.id_conteudo,
      materialNovo.id_conteudo,
      videoVisto.id_conteudo,
    ]);
  });

  it("separa só os bloqueados para a prévia", () => {
    expect(conteudosBloqueadosRecentes(itens)).toEqual([itemBloqueado]);
  });
});
