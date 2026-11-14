import { describe, expect, it } from "vitest";

import type { QuebraCabecaAdmin } from "../tipos/quebra-cabeca-admin";
import { alteracoesDoQuebraCabeca, valoresDoQuebraCabeca } from "./edicao-quebra-cabeca";

const recortes = Array.from({ length: 8 }, (_, indice) => `https://img.test/${indice}.png`);

const detalhe: QuebraCabecaAdmin = {
  id_quebra_cabeca: "id",
  nome: "Fundação",
  legenda: "Onde tudo começou",
  historia: "História",
  imagem_original: "https://img.test/completa.jpg",
  situacao: "PUBLICADO",
  pecas: recortes.map((recorte, indice) => ({ id_peca: `p${indice}`, indice, recorte })).reverse(),
  pode_trocar_imagem: true,
};

const original = valoresDoQuebraCabeca(detalhe);

describe("valoresDoQuebraCabeca", () => {
  it("ordena os recortes pelo índice", () => {
    expect(original.recortes).toEqual(recortes);
  });
});

describe("alteracoesDoQuebraCabeca", () => {
  it("envia só a legenda quando só ela mudou", () => {
    expect(alteracoesDoQuebraCabeca(original, { ...original, legenda: "Nova legenda" })).toEqual({
      tipo: "ok",
      alteracoes: { legenda: "Nova legenda" },
    });
  });

  it("não envia nada quando nada mudou", () => {
    expect(alteracoesDoQuebraCabeca(original, original)).toEqual({ tipo: "ok", alteracoes: {} });
  });

  it("pede os recortes junto quando só a imagem completa mudou", () => {
    expect(
      alteracoesDoQuebraCabeca(original, {
        ...original,
        imagem_original: "https://img.test/nova.jpg",
      }),
    ).toEqual({ tipo: "imagem-sem-recortes" });
  });

  it("envia a imagem e os 8 recortes juntos quando um recorte mudou", () => {
    const novos = [...recortes];
    novos[3] = "https://img.test/novo-3.png";

    expect(alteracoesDoQuebraCabeca(original, { ...original, recortes: novos })).toEqual({
      tipo: "ok",
      alteracoes: { imagem_original: original.imagem_original, recortes: novos },
    });
  });
});
