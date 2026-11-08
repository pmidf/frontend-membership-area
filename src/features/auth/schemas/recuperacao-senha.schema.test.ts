import { describe, expect, it } from "vitest";

import { esquemaEsqueciSenha, esquemaNovaSenha } from "./recuperacao-senha.schema";

function errosNovaSenha(nova_senha: string, confirmacao: string) {
  const resultado = esquemaNovaSenha.safeParse({ nova_senha, confirmacao });
  return resultado.success
    ? []
    : resultado.error.issues.map(({ path, message }) => [path[0], message]);
}

describe("esquemaNovaSenha", () => {
  it("aceita senhas iguais entre 10 e 128 caracteres", () => {
    expect(errosNovaSenha("SenhaForte2026!", "SenhaForte2026!")).toEqual([]);
  });

  it("exige o tamanho mínimo e o máximo do backend", () => {
    expect(errosNovaSenha("curta", "curta")).toEqual([
      ["nova_senha", "Use pelo menos 10 caracteres"],
    ]);
    const longa = "a".repeat(129);
    expect(errosNovaSenha(longa, longa)).toEqual([["nova_senha", "Use no máximo 128 caracteres"]]);
  });

  it("aponta a confirmação diferente mesmo quando a senha também tem erro", () => {
    expect(errosNovaSenha("SenhaForte2026!", "OutraSenha2026!")).toEqual([
      ["confirmacao", "As senhas não conferem"],
    ]);
    expect(errosNovaSenha("curta", "outra")).toEqual([
      ["nova_senha", "Use pelo menos 10 caracteres"],
      ["confirmacao", "As senhas não conferem"],
    ]);
    expect(errosNovaSenha("SenhaForte2026!", "")).toEqual([
      ["confirmacao", "Confirme a nova senha"],
      ["confirmacao", "As senhas não conferem"],
    ]);
  });
});

describe("esquemaEsqueciSenha", () => {
  it("exige um e-mail válido", () => {
    expect(esquemaEsqueciSenha.safeParse({ email: "maria@pmidf.org.br" }).success).toBe(true);
    expect(esquemaEsqueciSenha.safeParse({ email: "maria@" }).success).toBe(false);
  });
});
