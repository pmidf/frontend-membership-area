import { describe, expect, it } from "vitest";

import { perfilFiliado } from "@/test/fixtures/pessoas";

import { camposAlterados, valoresDoPerfil } from "./campos-alterados";

const iniciais = valoresDoPerfil(perfilFiliado);

describe("valoresDoPerfil", () => {
  it("aplica as máscaras e troca nulos por texto vazio", () => {
    const valores = valoresDoPerfil({ ...perfilFiliado, complemento: null, linkedin_url: null });

    expect(valores).toMatchObject({
      telefone: "(61) 9 9123-4567",
      cep: "70040-010",
      complemento: "",
      linkedin_url: "",
    });
  });
});

describe("camposAlterados", () => {
  it("devolve vazio quando nada mudou", () => {
    expect(camposAlterados(iniciais, { ...iniciais })).toEqual({});
  });

  it("devolve só o que mudou, sem máscara", () => {
    expect(
      camposAlterados(iniciais, { ...iniciais, telefone: "(61) 9 8888-7777", cargo: "Diretora" }),
    ).toEqual({ telefone: "61988887777", cargo: "Diretora" });
  });

  it("ignora diferença só de espaços nas pontas", () => {
    expect(camposAlterados(iniciais, { ...iniciais, cargo: `  ${iniciais.cargo} ` })).toEqual({});
  });

  it("envia nulo ao limpar LinkedIn e complemento", () => {
    expect(camposAlterados(iniciais, { ...iniciais, linkedin_url: "", complemento: " " })).toEqual({
      linkedin_url: null,
      complemento: null,
    });
  });

  it("não envia LinkedIn que já estava vazio", () => {
    const semLinkedin = valoresDoPerfil({ ...perfilFiliado, linkedin_url: null });

    expect(camposAlterados(semLinkedin, { ...semLinkedin })).toEqual({});
  });
});
