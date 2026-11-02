import { describe, expect, it } from "vitest";

import { esquemaLogin, TAMANHO_MAXIMO_SENHA } from "./login.schema";

function mensagens(dados: unknown) {
  const resultado = esquemaLogin.safeParse(dados);
  return resultado.success ? [] : resultado.error.issues.map(({ message }) => message);
}

describe("esquemaLogin", () => {
  it("aceita e-mail válido e senha informada", () => {
    expect(mensagens({ email: " maria@pmidf.org.br ", senha: "x" })).toEqual([]);
  });

  it("exige e-mail e senha", () => {
    expect(mensagens({ email: "", senha: "" })).toEqual([
      "Informe seu e-mail",
      "Informe sua senha",
    ]);
  });

  it("recusa e-mail malformado e senha acima do limite do backend", () => {
    expect(mensagens({ email: "maria@", senha: "a".repeat(TAMANHO_MAXIMO_SENHA + 1) })).toEqual([
      "Informe um e-mail válido",
      "Use no máximo 128 caracteres",
    ]);
  });
});
