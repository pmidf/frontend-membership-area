import { describe, expect, it } from "vitest";

import { esquemaQuebraCabeca, valoresIniciais } from "../schemas/quebra-cabeca.schema";
import { acoesPorSituacao } from "./acoes-por-situacao";

const recortes = Array.from({ length: 8 }, (_, indice) => `https://img.test/peca-${indice}.png`);

const valido = {
  nome: "Fundação do PMI-DF",
  legenda: "Onde tudo começou",
  historia: "A reunião que deu origem ao capítulo.",
  imagem_original: "https://img.test/fundacao.jpg",
  recortes,
};

function errosDe(dados: unknown): Record<string, string> {
  const resultado = esquemaQuebraCabeca.safeParse(dados);
  if (resultado.success) return {};
  return Object.fromEntries(
    resultado.error.issues.map((issue) => [issue.path.join("."), issue.message]),
  );
}

describe("esquemaQuebraCabeca", () => {
  it("aceita um quebra-cabeça completo", () => {
    expect(esquemaQuebraCabeca.safeParse(valido).success).toBe(true);
  });

  it("exige exatamente 8 recortes", () => {
    expect(errosDe({ ...valido, recortes: recortes.slice(0, 7) })).toEqual({
      recortes: "Informe as 8 peças",
    });
  });

  it("recusa recortes vazios e extensões que não são de imagem", () => {
    const erros = errosDe({
      ...valido,
      recortes: ["", "https://img.test/peca.gif", ...recortes.slice(2)],
    });

    expect(erros["recortes.0"]).toBe("Informe a URL desta peça");
    expect(erros["recortes.1"]).toBe("A imagem deve ser JPG, PNG ou WebP");
  });

  it("limita a legenda a 60 e o nome a 100 caracteres", () => {
    const erros = errosDe({ ...valido, legenda: "a".repeat(61), nome: "n".repeat(101) });

    expect(erros.legenda).toBe("Use no máximo 60 caracteres");
    expect(erros.nome).toBe("Use no máximo 100 caracteres");
  });

  it("começa com os 8 campos de recorte vazios", () => {
    expect(valoresIniciais.recortes).toEqual(Array(8).fill(""));
  });
});

describe("acoesPorSituacao", () => {
  it("só oferece publicar ao rascunho", () => {
    expect(acoesPorSituacao("RASCUNHO")).toEqual(["editar", "publicar"]);
    expect(acoesPorSituacao("PUBLICADO")).toEqual(["editar"]);
    expect(acoesPorSituacao("FORA_DO_AR")).toEqual(["editar"]);
  });
});
