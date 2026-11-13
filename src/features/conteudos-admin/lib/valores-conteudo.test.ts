import { describe, expect, it } from "vitest";

import { conteudoArquivado, conteudoVideo } from "../mocks/conteudos-admin.handlers";
import {
  camposAlteradosDoConteudo,
  dadosParaCriar,
  valoresDoConteudo,
  VALORES_NOVO_CONTEUDO,
} from "./valores-conteudo";

describe("valores do conteúdo", () => {
  it("mostra a duração em minutos arredondados e o acesso como opção", () => {
    expect(valoresDoConteudo(conteudoVideo)).toMatchObject({
      duracao_minutos: "42",
      acesso: "EXCLUSIVO",
    });
    expect(valoresDoConteudo(conteudoArquivado).duracao_minutos).toBe("");
  });

  it("não reenvia a duração quando os minutos não mudam", () => {
    const iniciais = valoresDoConteudo(conteudoVideo);

    expect(camposAlteradosDoConteudo(iniciais, { ...iniciais })).toEqual({});
    expect(camposAlteradosDoConteudo(iniciais, { ...iniciais, duracao_minutos: "50" })).toEqual({
      duracao_segundos: 3000,
    });
    expect(camposAlteradosDoConteudo(iniciais, { ...iniciais, duracao_minutos: "" })).toEqual({
      duracao_segundos: null,
    });
  });

  it("converte o acesso e ignora a duração de material ao criar", () => {
    expect(
      dadosParaCriar({
        ...VALORES_NOVO_CONTEUDO,
        titulo: " Canvas ",
        tipo: "MATERIAL",
        url: "https://exemplo.test/canvas.pdf",
        descricao: "Modelo",
        cod_categoria: "c1",
        acesso: "PUBLICO",
        duracao_minutos: "10",
      }),
    ).toEqual({
      titulo: "Canvas",
      tipo: "MATERIAL",
      url: "https://exemplo.test/canvas.pdf",
      descricao: "Modelo",
      cod_categoria: "c1",
      bol_exclusivo: false,
    });
  });
});
