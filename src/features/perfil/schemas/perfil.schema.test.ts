import { describe, expect, it } from "vitest";

import { perfilFiliado } from "@/test/fixtures/pessoas";

import { valoresDoPerfil } from "../lib/campos-alterados";
import { esquemaPerfil } from "./perfil.schema";

const validos = valoresDoPerfil(perfilFiliado);

function mensagemDe(campo: string, valor: string) {
  const resultado = esquemaPerfil.safeParse({ ...validos, [campo]: valor });
  return resultado.error?.issues.find((erro) => erro.path[0] === campo)?.message;
}

describe("esquemaPerfil", () => {
  it("aceita os dados do perfil, com máscaras", () => {
    expect(esquemaPerfil.safeParse(validos).success).toBe(true);
  });

  it("aceita LinkedIn e complemento vazios", () => {
    expect(esquemaPerfil.safeParse({ ...validos, linkedin_url: "", complemento: "" }).success).toBe(
      true,
    );
  });

  it.each([
    ["nome_completo", "Jo", "Informe seu nome completo"],
    ["telefone", "(61) 9", "Informe o telefone com DDD"],
    ["data_nascimento", "2020-01-01", "É preciso ter 18 anos ou mais"],
    ["cep", "700", "Informe um CEP válido"],
    ["numero", "", "Informe o número"],
    ["empresa", " ", "Informe a empresa onde trabalha"],
    [
      "linkedin_url",
      "https://exemplo.com/ana",
      "Use o endereço completo do seu perfil (https://linkedin.com/in/...)",
    ],
  ])("recusa %s = %j", (campo, valor, mensagem) => {
    expect(mensagemDe(campo, valor)).toBe(mensagem);
  });
});
