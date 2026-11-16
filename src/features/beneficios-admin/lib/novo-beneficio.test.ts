import { describe, expect, it } from "vitest";

import { parceirosTeste } from "../mocks/beneficios-admin.handlers";
import { esquemaNovoBeneficio, type DadosNovoBeneficio } from "../schemas/beneficio.schema";
import { dadosParaCriar, VALORES_NOVO_BENEFICIO } from "./valores-beneficio";

const valido: DadosNovoBeneficio = {
  ...VALORES_NOVO_BENEFICIO,
  titulo: " Voucher ",
  legenda: "Desconto",
  descricao: "Texto",
  imagem: "https://exemplo.com/a.webp",
  cod_parceiro: parceirosTeste[0].cod_parceiro,
  cod_cupom: "PMI",
  vigencia_inicio: "2026-12-01",
};

function mensagem(dados: Partial<DadosNovoBeneficio>, campo: string) {
  const resultado = esquemaNovoBeneficio.safeParse({ ...valido, ...dados });
  return resultado.error?.issues.find((erro) => erro.path[0] === campo)?.message;
}

describe("esquemaNovoBeneficio", () => {
  it("aceita um benefício completo", () => {
    expect(esquemaNovoBeneficio.safeParse(valido).success).toBe(true);
  });

  it("exige um parceiro com UUID", () => {
    expect(mensagem({ cod_parceiro: "" }, "cod_parceiro")).toBe("Selecione o parceiro");
    expect(mensagem({ cod_parceiro: "abc" }, "cod_parceiro")).toBe("Selecione o parceiro");
  });

  it("mantém as regras de resgate, imagem e vigência", () => {
    expect(mensagem({ cod_cupom: "" }, "cod_cupom")).toBe("Informe o código do cupom");
    expect(mensagem({ tipo_resgate: "INSTRUCAO" }, "desc_instrucao")).toBe(
      "Informe a instrução de resgate",
    );
    expect(mensagem({ imagem: "https://exemplo.com/a.gif" }, "imagem")).toBe(
      "A imagem deve ser JPG, PNG ou WebP",
    );
    expect(mensagem({ vigencia_fim: "2026-11-30" }, "vigencia_fim")).toBe(
      "O fim da vigência não pode ser anterior ao início",
    );
    expect(mensagem({ vigencia_fim: "2026-12-01" }, "vigencia_fim")).toBeUndefined();
  });
});

describe("dadosParaCriar", () => {
  it("envia só os campos do DTO, com o campo do outro tipo nulo", () => {
    expect(dadosParaCriar(valido)).toEqual({
      titulo: "Voucher",
      legenda: "Desconto",
      descricao: "Texto",
      imagem: "https://exemplo.com/a.webp",
      categoria: "EDUCACAO",
      cod_parceiro: parceirosTeste[0].cod_parceiro,
      tipo_resgate: "CUPOM",
      cod_cupom: "PMI",
      desc_instrucao: null,
      vigencia_inicio: "2026-12-01",
      vigencia_fim: null,
    });
  });

  it("anula o cupom no tipo instrução", () => {
    expect(
      dadosParaCriar({ ...valido, tipo_resgate: "INSTRUCAO", desc_instrucao: " Passo " }),
    ).toMatchObject({ cod_cupom: null, desc_instrucao: "Passo" });
  });
});
