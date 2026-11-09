import { describe, expect, it } from "vitest";

import { beneficioAdminTeste } from "../mocks/beneficios-admin.handlers";
import { esquemaBeneficio } from "../schemas/beneficio.schema";
import { acoesPorSituacao } from "./acoes-por-situacao";
import { camposAlteradosDoBeneficio, valoresDoBeneficio } from "./valores-beneficio";

const cupom = valoresDoBeneficio(beneficioAdminTeste);
const instrucao = valoresDoBeneficio({
  ...beneficioAdminTeste,
  tipo_resgate: "INSTRUCAO",
  cod_cupom: null,
  desc_instrucao: "<p>Fale com o parceiro.</p>",
});

function mensagem(dados: object, campo: string) {
  const resultado = esquemaBeneficio.safeParse({ ...cupom, ...dados });
  return resultado.error?.issues.find((erro) => erro.path[0] === campo)?.message;
}

describe("esquemaBeneficio", () => {
  it("aceita um benefício de cupom e um de instrução", () => {
    expect(esquemaBeneficio.safeParse(cupom).success).toBe(true);
    expect(esquemaBeneficio.safeParse(instrucao).success).toBe(true);
  });

  it.each([
    ["titulo", "", "Informe o título"],
    ["titulo", "a".repeat(151), "Use no máximo 150 caracteres"],
    ["legenda", "a".repeat(91), "Use no máximo 90 caracteres"],
    ["descricao", " ", "Informe a descrição"],
    ["imagem", "nao-e-url", "Informe uma URL http(s) válida"],
    ["imagem", "ftp://exemplo.com/a.png", "Informe uma URL http(s) válida"],
    ["imagem", "http://localhost/a.png", "Informe uma URL http(s) válida"],
    ["imagem", "https://exemplo.com/a.gif", "A imagem deve ser JPG, PNG ou WebP"],
    ["vigencia_inicio", "", "Informe o início da vigência"],
  ])("recusa %s = %j", (campo, valor, texto) => {
    expect(mensagem({ [campo]: valor }, campo)).toBe(texto);
  });

  it.each([
    "https://exemplo.com/a.jpg",
    "https://exemplo.com/a.JPEG",
    "http://exemplo.com/a.webp?v=1#x",
  ])("aceita a imagem %s", (imagem) => {
    expect(mensagem({ imagem }, "imagem")).toBeUndefined();
  });

  it("exige o código no cupom e a instrução com texto", () => {
    expect(mensagem({ cod_cupom: " " }, "cod_cupom")).toBe("Informe o código do cupom");
    expect(mensagem({ ...instrucao, desc_instrucao: "<p> </p>" }, "desc_instrucao")).toBe(
      "Informe a instrução de resgate",
    );
  });

  it("recusa fim anterior ao início e aceita o mesmo dia ou nenhum", () => {
    expect(
      mensagem({ vigencia_inicio: "2026-06-02", vigencia_fim: "2026-06-01" }, "vigencia_fim"),
    ).toBe("O fim da vigência não pode ser anterior ao início");
    expect(
      mensagem({ vigencia_inicio: "2026-06-02", vigencia_fim: "2026-06-02" }, "vigencia_fim"),
    ).toBeUndefined();
    expect(mensagem({ vigencia_fim: "" }, "vigencia_fim")).toBeUndefined();
  });
});

describe("camposAlteradosDoBeneficio", () => {
  it("devolve só o que mudou", () => {
    expect(camposAlteradosDoBeneficio(cupom, { ...cupom, titulo: " Novo " })).toEqual({
      titulo: "Novo",
    });
    expect(camposAlteradosDoBeneficio(cupom, { ...cupom })).toEqual({});
  });

  it("envia nulo ao limpar o fim da vigência", () => {
    expect(camposAlteradosDoBeneficio(cupom, { ...cupom, vigencia_fim: "" })).toEqual({
      vigencia_fim: null,
    });
  });

  it("anula o campo do outro tipo ao trocar a forma de resgate", () => {
    expect(
      camposAlteradosDoBeneficio(cupom, {
        ...cupom,
        tipo_resgate: "INSTRUCAO",
        desc_instrucao: "Passo a passo",
      }),
    ).toEqual({ tipo_resgate: "INSTRUCAO", cod_cupom: null, desc_instrucao: "Passo a passo" });
  });
});

describe("acoesPorSituacao", () => {
  it.each([
    ["RASCUNHO", ["salvar", "publicar", "arquivar"]],
    ["PUBLICADO", ["salvar", "despublicar", "arquivar"]],
    ["ARQUIVADO", ["duplicar"]],
  ] as const)("%s oferece as ações corretas", (situacao, acoes) => {
    expect(acoesPorSituacao(situacao)).toEqual(acoes);
  });
});
