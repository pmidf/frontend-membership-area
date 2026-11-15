import { describe, expect, it } from "vitest";

import {
  filtrarParticipantes,
  rotuloCheckIn,
  rotuloVinculo,
  type LinhaParticipante,
} from "./linhas-participantes";

function linha(dados: Partial<LinhaParticipante> = {}): LinhaParticipante {
  return {
    id: "p1",
    nome: "Ana Lúcia",
    email: "ana@exemplo.com",
    tipoIngresso: "Membro",
    checkIn: false,
    checkInEm: null,
    cancelado: false,
    vinculo: { tipo: "nao-vinculado" },
    ...dados,
  };
}

const confirmado = linha({
  id: "confirmado",
  nome: "Bruno",
  email: "bruno@exemplo.com",
  checkIn: true,
  checkInEm: "2026-11-29T11:42:00.000Z",
  tipoIngresso: "Não membro",
  vinculo: { tipo: "nao-membro" },
});
const pendente = linha({ id: "pendente" });
const cancelado = linha({
  id: "cancelado",
  nome: "Carla",
  email: "carla@exemplo.com",
  cancelado: true,
  vinculo: { tipo: "vinculado", pessoaId: "1", pessoaNome: "Carla Souza", origem: "manual" },
});
const canceladoComCheckIn = linha({ id: "cancelado-check-in", cancelado: true, checkIn: true });
const todas = [confirmado, pendente, cancelado, canceladoComCheckIn];
const ids = (lista: LinhaParticipante[]) => lista.map((l) => l.id);

describe("filtrarParticipantes", () => {
  it("sem filtros, retorna todas", () => {
    expect(ids(filtrarParticipantes(todas, {}))).toEqual(ids(todas));
  });

  it("busca por nome ou e-mail ignorando acentos", () => {
    expect(ids(filtrarParticipantes(todas, { busca: "LUCIA" }))).toEqual([
      "pendente",
      "cancelado-check-in",
    ]);
    expect(ids(filtrarParticipantes(todas, { busca: "bruno@" }))).toEqual(["confirmado"]);
  });

  it.each([
    ["confirmado", ["confirmado"]],
    ["pendente", ["pendente"]],
    ["cancelado", ["cancelado", "cancelado-check-in"]],
  ] as const)("filtra check-in %s", (checkIn, esperado) => {
    expect(ids(filtrarParticipantes(todas, { checkIn }))).toEqual(esperado);
  });

  it("filtra por tipo de ingresso", () => {
    expect(ids(filtrarParticipantes(todas, { tipo: "Não membro" }))).toEqual(["confirmado"]);
  });

  it("filtra por vínculo", () => {
    expect(ids(filtrarParticipantes(todas, { vinculo: "vinculado" }))).toEqual(["cancelado"]);
  });
});

describe("rotuloCheckIn", () => {
  it("ingresso cancelado", () => {
    expect(rotuloCheckIn(cancelado, false)).toBe("Ingresso cancelado");
  });

  it("confirmado com horário no fuso da agenda", () => {
    expect(rotuloCheckIn(confirmado, false)).toBe("Confirmado · 29/11 08h42");
  });

  it("confirmado sem horário", () => {
    expect(rotuloCheckIn(linha({ checkIn: true }), false)).toBe("Confirmado");
  });

  it("sem check-in depende de o evento ter encerrado", () => {
    expect(rotuloCheckIn(pendente, false)).toBe("Pendente");
    expect(rotuloCheckIn(pendente, true)).toBe("Não compareceu");
  });
});

describe("rotuloVinculo", () => {
  it.each([
    [cancelado.vinculo, "Carla Souza"],
    [confirmado.vinculo, "Não é membro"],
    [pendente.vinculo, "Não vinculado"],
  ])("para %j responde %s", (vinculo, esperado) => {
    expect(rotuloVinculo(vinculo)).toBe(esperado);
  });
});
