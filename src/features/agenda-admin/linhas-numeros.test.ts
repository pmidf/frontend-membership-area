import { describe, expect, it } from "vitest";

import { filtrarLinhas, type LinhaNumeros } from "./linhas-numeros";

function linha(dados: Partial<LinhaNumeros> = {}): LinhaNumeros {
  return {
    id: "1",
    titulo: "Encontro de Gestão",
    inicio: "2026-11-20T22:00:00.000Z",
    formato: "online",
    categoria: "Palestra",
    situacao: "ativo",
    cancelado: false,
    encerrado: false,
    inscritos: 10,
    presentes: 8,
    ausentes: 2,
    cancelados: 0,
    taxa: 0.8,
    ...dados,
  };
}

const gestao = linha({ id: "gestao" });
const workshop = linha({
  id: "workshop",
  titulo: "Workshop de Riscos",
  formato: "presencial",
  categoria: "Workshop",
  situacao: "inativo",
});
const todas = [gestao, workshop];
const ids = (lista: LinhaNumeros[]) => lista.map((l) => l.id);

describe("filtrarLinhas", () => {
  it("sem filtros, retorna todas", () => {
    expect(ids(filtrarLinhas(todas, {}))).toEqual(["gestao", "workshop"]);
  });

  it("busca no título ignorando acentos e caixa", () => {
    expect(ids(filtrarLinhas(todas, { busca: "GESTAO" }))).toEqual(["gestao"]);
  });

  it("filtra por situação, formato e categoria", () => {
    expect(ids(filtrarLinhas(todas, { situacao: "inativo" }))).toEqual(["workshop"]);
    expect(ids(filtrarLinhas(todas, { formato: "online" }))).toEqual(["gestao"]);
    expect(ids(filtrarLinhas(todas, { categoria: "Workshop" }))).toEqual(["workshop"]);
  });

  it("combina filtros", () => {
    expect(filtrarLinhas(todas, { formato: "online", categoria: "Workshop" })).toEqual([]);
  });
});
