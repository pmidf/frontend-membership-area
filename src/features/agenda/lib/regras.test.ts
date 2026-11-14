import { describe, expect, it } from "vitest";

import type { Evento, EventoComParticipacao } from "../types";
import {
  aceitaInscricao,
  atendeFiltros,
  eventosRecentesEncerrados,
  filtrarParaLista,
  formatoDoEvento,
  jaAconteceu,
  rotuloFormato,
  rotuloParticipacao,
  visivelNaAgenda,
} from "./regras";

const agora = new Date("2026-11-14T12:00:00.000Z");

function evento(dados: Partial<Evento> = {}): Evento {
  return {
    id: "1",
    titulo: "Encontro de Gestão",
    descricao: "Descrição",
    inicio: "2026-11-20T22:00:00.000Z",
    fim: "2026-11-20T23:59:00.000Z",
    urlSympla: "https://www.sympla.com.br/evento/1",
    endereco: null,
    categoria: "Palestra",
    cancelado: false,
    ...dados,
  };
}

const endereco = {
  nome: "Impact Hub",
  logradouro: "SGAN 601",
  cidade: "Brasília",
  uf: "DF",
};

describe("formatoDoEvento e rotuloFormato", () => {
  it("evento sem endereço é online", () => {
    expect(formatoDoEvento(evento())).toBe("online");
    expect(rotuloFormato("online")).toBe("Online");
  });

  it("evento com endereço é presencial", () => {
    expect(formatoDoEvento(evento({ endereco }))).toBe("presencial");
    expect(rotuloFormato("presencial")).toBe("Presencial");
  });
});

describe("jaAconteceu e aceitaInscricao", () => {
  it("evento futuro aceita inscrição", () => {
    expect(jaAconteceu(evento(), agora)).toBe(false);
    expect(aceitaInscricao(evento(), agora)).toBe(true);
  });

  it("evento encerrado não aceita inscrição", () => {
    const passado = evento({ fim: "2026-11-13T12:00:00.000Z" });
    expect(jaAconteceu(passado, agora)).toBe(true);
    expect(aceitaInscricao(passado, agora)).toBe(false);
  });

  it("evento cancelado não aceita inscrição", () => {
    expect(aceitaInscricao(evento({ cancelado: true }), agora)).toBe(false);
  });

  it("usa a data atual quando não recebe referência", () => {
    expect(jaAconteceu(evento({ fim: "2000-01-01T00:00:00.000Z" }))).toBe(true);
    expect(aceitaInscricao(evento({ fim: "2999-01-01T00:00:00.000Z" }))).toBe(true);
  });
});

describe("visivelNaAgenda", () => {
  it("evento ativo é sempre visível", () => {
    expect(visivelNaAgenda(evento({ inicio: "2020-01-01T00:00:00.000Z" }), agora)).toBe(true);
  });

  it("cancelado fica visível até 7 dias após a data original", () => {
    const cancelado = evento({ cancelado: true, inicio: "2026-11-08T12:00:00.000Z" });
    expect(visivelNaAgenda(cancelado, agora)).toBe(true);
  });

  it("cancelado some depois de 7 dias", () => {
    const cancelado = evento({ cancelado: true, inicio: "2026-11-07T11:59:00.000Z" });
    expect(visivelNaAgenda(cancelado, agora)).toBe(false);
  });

  it("usa a data atual quando não recebe referência", () => {
    expect(visivelNaAgenda(evento({ cancelado: true, inicio: "2000-01-01T00:00:00.000Z" }))).toBe(
      false,
    );
  });
});

describe("atendeFiltros", () => {
  it("sem filtros, aceita qualquer evento", () => {
    expect(atendeFiltros(evento(), {})).toBe(true);
  });

  it("filtra por formato", () => {
    expect(atendeFiltros(evento(), { formato: "online" })).toBe(true);
    expect(atendeFiltros(evento(), { formato: "presencial" })).toBe(false);
  });

  it("filtra por categoria", () => {
    expect(atendeFiltros(evento(), { categoria: "Palestra" })).toBe(true);
    expect(atendeFiltros(evento(), { categoria: "Workshop" })).toBe(false);
  });

  it("busca no título ignorando acentos e caixa", () => {
    expect(atendeFiltros(evento(), { busca: "GESTAO" })).toBe(true);
    expect(atendeFiltros(evento(), { busca: "liderança" })).toBe(false);
  });
});

describe("filtrarParaLista", () => {
  const futuroProximo = evento({
    id: "proximo",
    inicio: "2026-11-20T22:00:00.000Z",
    fim: "2026-11-20T23:00:00.000Z",
  });
  const futuro60d = evento({
    id: "60d",
    inicio: "2027-01-10T22:00:00.000Z",
    fim: "2027-01-10T23:00:00.000Z",
  });
  const futuro120d = evento({
    id: "120d",
    inicio: "2027-03-14T22:00:00.000Z",
    fim: "2027-03-14T23:00:00.000Z",
  });
  const passadoAntigo = evento({
    id: "passado-antigo",
    inicio: "2026-10-01T22:00:00.000Z",
    fim: "2026-10-01T23:00:00.000Z",
  });
  const passadoRecente = evento({
    id: "passado-recente",
    inicio: "2026-11-10T22:00:00.000Z",
    fim: "2026-11-10T23:00:00.000Z",
  });
  const canceladoRecente = evento({
    id: "cancelado",
    cancelado: true,
    inicio: "2026-11-12T22:00:00.000Z",
    fim: "2026-11-12T23:00:00.000Z",
  });
  const todos = [
    futuro120d,
    passadoAntigo,
    futuro60d,
    canceladoRecente,
    futuroProximo,
    passadoRecente,
  ];
  const ids = (lista: Evento[]) => lista.map((e) => e.id);

  it("próximos: futuros e cancelados recentes, em ordem crescente", () => {
    expect(ids(filtrarParaLista(todos, { periodo: "proximos" }, agora))).toEqual([
      "cancelado",
      "proximo",
      "60d",
      "120d",
    ]);
  });

  it("30 dias limita o horizonte", () => {
    expect(ids(filtrarParaLista(todos, { periodo: "30d" }, agora))).toEqual([
      "cancelado",
      "proximo",
    ]);
  });

  it("90 dias limita o horizonte", () => {
    expect(ids(filtrarParaLista(todos, { periodo: "90d" }, agora))).toEqual([
      "cancelado",
      "proximo",
      "60d",
    ]);
  });

  it("passados: encerrados não cancelados, em ordem decrescente", () => {
    expect(ids(filtrarParaLista(todos, { periodo: "passados" }, agora))).toEqual([
      "passado-recente",
      "passado-antigo",
    ]);
  });

  it("aplica os demais filtros", () => {
    const presencial = evento({ ...futuroProximo, id: "presencial", endereco });
    expect(
      ids(
        filtrarParaLista(
          [...todos, presencial],
          { periodo: "proximos", formato: "presencial" },
          agora,
        ),
      ),
    ).toEqual(["presencial"]);
  });

  it("usa a data atual quando não recebe referência", () => {
    const distante = evento({
      inicio: "2999-01-01T00:00:00.000Z",
      fim: "2999-01-01T01:00:00.000Z",
    });
    expect(filtrarParaLista([distante], { periodo: "proximos" })).toEqual([distante]);
  });
});

describe("eventosRecentesEncerrados", () => {
  it("retorna os encerrados mais recentes, sem cancelados, até o limite", () => {
    const lista = [
      evento({ id: "a", inicio: "2026-10-01T10:00:00.000Z", fim: "2026-10-01T11:00:00.000Z" }),
      evento({ id: "b", inicio: "2026-11-01T10:00:00.000Z", fim: "2026-11-01T11:00:00.000Z" }),
      evento({ id: "c", inicio: "2026-11-05T10:00:00.000Z", fim: "2026-11-05T11:00:00.000Z" }),
      evento({
        id: "cancelado",
        cancelado: true,
        inicio: "2026-11-10T10:00:00.000Z",
        fim: "2026-11-10T11:00:00.000Z",
      }),
      evento({ id: "futuro" }),
    ];
    expect(eventosRecentesEncerrados(lista, 2, agora).map((e) => e.id)).toEqual(["c", "b"]);
  });

  it("usa a data atual quando não recebe referência", () => {
    const antigo = evento({ fim: "2000-01-01T00:00:00.000Z" });
    expect(eventosRecentesEncerrados([antigo], 5)).toEqual([antigo]);
  });
});

describe("rotuloParticipacao", () => {
  it.each([
    ["inscrito", "Inscrição confirmada"],
    ["presente", "Presença confirmada"],
    ["ausente", "Inscrição sem presença"],
    [null, null],
  ] as const)("para %s responde %s", (participacao, esperado) => {
    const comParticipacao: EventoComParticipacao = { ...evento(), participacao };
    expect(rotuloParticipacao(comParticipacao)).toBe(esperado);
  });
});
