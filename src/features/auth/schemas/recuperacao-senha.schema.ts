import { z } from "zod";

import { esquemaSenhaNova } from "@/shared/senha/regras-senha";

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
