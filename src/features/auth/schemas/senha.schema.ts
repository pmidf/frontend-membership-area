import { z } from "zod";

import { TAMANHO_MAXIMO_SENHA } from "./login.schema";

export const TAMANHO_MINIMO_SENHA = 10;

export const esquemaSenhaNova = z
  .string()
  .min(TAMANHO_MINIMO_SENHA, `Use pelo menos ${TAMANHO_MINIMO_SENHA} caracteres`)
  .max(TAMANHO_MAXIMO_SENHA, `Use no máximo ${TAMANHO_MAXIMO_SENHA} caracteres`);

export const esquemaEsqueciSenha = z.object({
  email: z.string().trim().min(1, "Informe seu e-mail").pipe(z.email("Informe um e-mail válido")),
});

export const esquemaNovaSenha = z
  .object({
    nova_senha: esquemaSenhaNova,
    confirmacao: z.string().min(1, "Confirme a nova senha"),
  })
  .refine(({ nova_senha, confirmacao }) => nova_senha === confirmacao, {
    path: ["confirmacao"],
    error: "As senhas não conferem",
    when: ({ value }) => typeof value === "object" && value !== null && "confirmacao" in value,
  });

export type DadosEsqueciSenha = z.infer<typeof esquemaEsqueciSenha>;
export type DadosNovaSenha = z.infer<typeof esquemaNovaSenha>;
