import { describe, expect, it } from "vitest";

import { oportunidadePorEmail, oportunidadeRascunho } from "../mocks/oportunidades-admin.handlers";
import {
  camposAlteradosDaOportunidade,
  dadosParaEnviar,
  valoresDaOportunidade,
  VALORES_NOVA_OPORTUNIDADE,
} from "./valores-oportunidade";

describe("valores da oportunidade", () => {
  it("manda os opcionais vazios como nulos e só o meio escolhido", () => {
    expect(
      dadosParaEnviar({
        ...VALORES_NOVA_OPORTUNIDADE,
        titulo: "  Analista  ",
        empresa: "Vega",
        descricao: "Texto",
        url_candidatura: " https://vega.com.br/vaga ",
        email_recrutador: "sobrou@vega.com.br",
        localidade: "   ",
      }),
    ).toEqual({
      titulo: "Analista",
      empresa: "Vega",
      descricao: "<p>Texto</p>",
      url_candidatura: "https://vega.com.br/vaga",
      email_recrutador: null,
      modalidade: null,
      localidade: null,
      logo_empresa: null,
      data_encerramento: null,
    });
  });

  it("converte os nulos da API em campos vazios do formulário", () => {
    expect(valoresDaOportunidade(oportunidadePorEmail)).toMatchObject({
      meio_candidatura: "EMAIL",
      url_candidatura: "",
      email_recrutador: "recrutamento@smartkanvas.com.br",
      logo_empresa: "",
      data_encerramento: "",
    });
  });

  it("mostra a descrição como texto e não a reenvia sem alteração", () => {
    const iniciais = valoresDaOportunidade(oportunidadeRascunho);

    expect(iniciais.descricao).toBe("Apoiar o PMO no acompanhamento de cronogramas.");
    expect(
      camposAlteradosDaOportunidade(iniciais, {
        ...iniciais,
        descricao: `${iniciais.descricao}\n`,
      }),
    ).toEqual({});
  });

  it("envia só os campos alterados", () => {
    const iniciais = valoresDaOportunidade(oportunidadeRascunho);

    expect(camposAlteradosDaOportunidade(iniciais, { ...iniciais })).toEqual({});
    expect(
      camposAlteradosDaOportunidade(iniciais, { ...iniciais, modalidade: "", titulo: "Novo" }),
    ).toEqual({ titulo: "Novo", modalidade: null });
  });

  it("ao trocar o meio, envia o novo e zera o outro", () => {
    const iniciais = valoresDaOportunidade(oportunidadeRascunho);

    expect(
      camposAlteradosDaOportunidade(iniciais, {
        ...iniciais,
        meio_candidatura: "EMAIL",
        email_recrutador: "rh@smartkanvas.com.br",
      }),
    ).toEqual({ url_candidatura: null, email_recrutador: "rh@smartkanvas.com.br" });
  });

  it("ao trocar só o link, reenvia o e-mail nulo junto", () => {
    const iniciais = valoresDaOportunidade(oportunidadeRascunho);

    expect(
      camposAlteradosDaOportunidade(iniciais, {
        ...iniciais,
        url_candidatura: "https://smartkanvas.com.br/nova",
      }),
    ).toEqual({ url_candidatura: "https://smartkanvas.com.br/nova", email_recrutador: null });
  });
});
