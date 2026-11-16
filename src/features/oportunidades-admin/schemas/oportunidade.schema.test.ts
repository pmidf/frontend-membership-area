import { describe, expect, it } from "vitest";

import { VALORES_NOVA_OPORTUNIDADE } from "../lib/valores-oportunidade";
import { esquemaOportunidade, type DadosOportunidade } from "./oportunidade.schema";

const valida: DadosOportunidade = {
  ...VALORES_NOVA_OPORTUNIDADE,
  titulo: "Analista de Projetos",
  empresa: "Vega",
  descricao: "Apoiar o PMO.",
  url_candidatura: "https://vega.com.br/vaga",
};

function errosDe(dados: DadosOportunidade): Record<string, string> {
  const resultado = esquemaOportunidade.safeParse(dados);
  if (resultado.success) return {};
  return Object.fromEntries(
    resultado.error.issues.map(({ path, message }) => [path.join("."), message]),
  );
}

describe("esquema da oportunidade", () => {
  it("aceita o cadastro mínimo", () => {
    expect(errosDe(valida)).toEqual({});
  });

  it("exige título, empresa e descrição", () => {
    expect(errosDe({ ...valida, titulo: " ", empresa: "", descricao: " \n " })).toEqual({
      titulo: "Informe o título",
      empresa: "Informe a empresa",
      descricao: "Informe a descrição",
    });
  });

  it("exige o link quando o meio é link e recusa protocolos que não são http(s)", () => {
    expect(errosDe({ ...valida, url_candidatura: "" })).toEqual({
      url_candidatura: "Informe a URL de candidatura",
    });
    expect(errosDe({ ...valida, url_candidatura: "javascript:alert(1)" })).toEqual({
      url_candidatura: "Informe uma URL http(s) válida",
    });
  });

  it("exige um e-mail válido quando o meio é e-mail, ignorando o link", () => {
    const porEmail = { ...valida, meio_candidatura: "EMAIL" as const, url_candidatura: "x" };

    expect(errosDe({ ...porEmail, email_recrutador: "" })).toEqual({
      email_recrutador: "Informe o e-mail do recrutador",
    });
    expect(errosDe({ ...porEmail, email_recrutador: "rh@" })).toEqual({
      email_recrutador: "Informe um e-mail válido",
    });
    expect(errosDe({ ...porEmail, email_recrutador: "rh@vega.com.br" })).toEqual({});
  });

  it("valida logo, localidade e data de encerramento", () => {
    expect(
      errosDe({
        ...valida,
        logo_empresa: "ftp://vega.com.br/logo.png",
        localidade: "x".repeat(101),
        data_encerramento: "2020-01-01",
      }),
    ).toEqual({
      logo_empresa: "Informe uma URL http(s) válida",
      localidade: "Use no máximo 100 caracteres",
      data_encerramento: "A data de encerramento não pode estar no passado",
    });
    expect(errosDe({ ...valida, data_encerramento: "2099-12-31" })).toEqual({});
  });
});
