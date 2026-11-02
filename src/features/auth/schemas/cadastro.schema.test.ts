import { describe, expect, it } from "vitest";

import {
  camposPorPasso,
  esquemaCadastro,
  idadeEmAnos,
  passoDoCampo,
  valoresIniciaisCadastro,
  type DadosCadastro,
} from "./cadastro.schema";

const valido: DadosCadastro = {
  nome_completo: "Maria Souza",
  filiado_pmi: "nao",
  pmi_id: "",
  email: "maria@teste.pmidf.org.br",
  senha: "SenhaForte2026!",
  aceite_termos: true,
  telefone: "(61) 9 9123-4567",
  data_nascimento: "1990-05-12",
  genero: "FEMININO",
  escolaridade: "MESTRADO",
  cep: "70040-010",
  logradouro: "SBS Quadra 2",
  numero: "10",
  complemento: "",
  bairro: "Asa Sul",
  cidade: "Brasília",
  uf: "DF",
  empresa: "Construtora Vega",
  cargo: "Gerente de Projetos",
  linkedin_url: "",
};

function errosDe(dados: Partial<DadosCadastro>) {
  const resultado = esquemaCadastro.safeParse({ ...valido, ...dados });
  if (resultado.success) return {};
  return Object.fromEntries(
    resultado.error.issues.map(({ path, message }) => [String(path[0]), message]),
  );
}

describe("esquemaCadastro", () => {
  it("aceita um cadastro completo e válido", () => {
    expect(errosDe({})).toEqual({});
  });

  it("aplica os limites do backend aos dados de acesso", () => {
    expect(errosDe({ nome_completo: " Ma " })).toEqual({
      nome_completo: "Informe seu nome completo",
    });
    expect(errosDe({ senha: "curta" })).toEqual({ senha: "Use pelo menos 10 caracteres" });
    expect(errosDe({ senha: "a".repeat(129) })).toEqual({ senha: "Use no máximo 128 caracteres" });
    expect(errosDe({ email: `${"a".repeat(250)}@x.com` })).toEqual({
      email: "Use no máximo 254 caracteres",
    });
    expect(errosDe({ aceite_termos: false })).toEqual({
      aceite_termos: "É preciso aceitar os Termos de Uso e a Política de Privacidade",
    });
  });

  it("exige a resposta sobre a filiação e o PMI ID só com Sim", () => {
    expect(errosDe({ filiado_pmi: "" as DadosCadastro["filiado_pmi"] })).toEqual({
      filiado_pmi: "Responda se você já é filiado ao PMI",
    });
    expect(errosDe({ filiado_pmi: "sim", pmi_id: "" })).toEqual({
      pmi_id: "Informe seu PMI ID (só números)",
    });
    expect(errosDe({ filiado_pmi: "sim", pmi_id: "12ab" })).toEqual({
      pmi_id: "Informe seu PMI ID (só números)",
    });
    expect(errosDe({ filiado_pmi: "sim", pmi_id: "1".repeat(21) })).toEqual({
      pmi_id: "Informe seu PMI ID (só números)",
    });
    expect(errosDe({ filiado_pmi: "sim", pmi_id: "1000001" })).toEqual({});
    expect(errosDe({ filiado_pmi: "nao", pmi_id: "abc" })).toEqual({});
  });

  it("avalia o PMI ID mesmo quando outros campos do passo têm erro", () => {
    expect(errosDe({ filiado_pmi: "sim", pmi_id: "", senha: "curta" })).toEqual({
      senha: "Use pelo menos 10 caracteres",
      pmi_id: "Informe seu PMI ID (só números)",
    });
  });

  it("valida telefone, CEP e UF sem a máscara", () => {
    expect(errosDe({ telefone: "(61) 3321-4567" })).toEqual({});
    expect(errosDe({ telefone: "(61) 9 9123" })).toEqual({
      telefone: "Informe o telefone com DDD",
    });
    expect(errosDe({ cep: "70040" })).toEqual({ cep: "Informe um CEP válido" });
    expect(errosDe({ uf: "XX" as DadosCadastro["uf"] })).toEqual({ uf: "Selecione a UF" });
  });

  it("recusa quem tem menos de 18 anos e data vazia", () => {
    const ano = new Date().getUTCFullYear();
    expect(errosDe({ data_nascimento: `${ano - 10}-01-01` })).toEqual({
      data_nascimento: "É preciso ter 18 anos ou mais para criar conta",
    });
    expect(errosDe({ data_nascimento: "" })).toEqual({
      data_nascimento: "Informe sua data de nascimento",
    });
  });

  it("aceita LinkedIn vazio ou do linkedin.com com https", () => {
    expect(errosDe({ linkedin_url: "https://www.linkedin.com/in/maria" })).toEqual({});
    expect(errosDe({ linkedin_url: "http://linkedin.com/in/maria" })).toEqual({
      linkedin_url: "Use o endereço completo do seu perfil (https://linkedin.com/in/...)",
    });
    expect(errosDe({ linkedin_url: "https://github.com/maria" })).toHaveProperty("linkedin_url");
  });

  it("aplica os limites de endereço e profissão", () => {
    expect(errosDe({ numero: "12345678901" })).toEqual({ numero: "Use no máximo 10 caracteres" });
    expect(errosDe({ complemento: "a".repeat(101) })).toEqual({
      complemento: "Use no máximo 100 caracteres",
    });
    expect(errosDe({ empresa: "" })).toEqual({ empresa: "Informe a empresa onde trabalha" });
  });

  it("começa com todos os campos vazios", () => {
    expect(Object.keys(valoresIniciaisCadastro).sort()).toEqual(
      camposPorPasso.flat().slice().sort(),
    );
  });
});

describe("idadeEmAnos e passoDoCampo", () => {
  it("conta a idade pelo aniversário em UTC, como o backend", () => {
    const hoje = new Date("2026-11-02T12:00:00.000Z");
    expect(idadeEmAnos("2008-11-02", hoje)).toBe(18);
    expect(idadeEmAnos("2008-11-03", hoje)).toBe(17);
    expect(idadeEmAnos("1990-05-12", hoje)).toBe(36);
  });

  it("localiza o passo de cada campo", () => {
    expect(passoDoCampo("email")).toBe(0);
    expect(passoDoCampo("telefone")).toBe(1);
    expect(passoDoCampo("uf")).toBe(2);
    expect(passoDoCampo("linkedin_url")).toBe(3);
    expect(passoDoCampo("desconhecido")).toBe(3);
  });
});
