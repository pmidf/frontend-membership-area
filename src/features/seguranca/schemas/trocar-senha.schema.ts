import { z } from "zod";

import { esquemaSenhaInformada, esquemaSenhaNova } from "@/shared/senha/regras-senha";

export const esquemaTrocarSenha = z
  .object({
    senha_atual: esquemaSenhaInformada("Informe sua senha atual"),
    nova_senha: esquemaSenhaNova,
    confirmacao: z.string().min(1, "Confirme a nova senha"),
  })
  .refine(({ nova_senha, confirmacao }) => nova_senha === confirmacao, {
    path: ["confirmacao"],
    error: "As senhas não conferem",
    when: ({ value }) => typeof value === "object" && value !== null && "confirmacao" in value,
  });

export type DadosTrocarSenha = z.infer<typeof esquemaTrocarSenha>;
