import { z } from "zod";

export const TAMANHO_MAXIMO_SENHA = 128;

export const esquemaLogin = z.object({
  email: z.string().trim().min(1, "Informe seu e-mail").pipe(z.email("Informe um e-mail válido")),
  senha: z
    .string()
    .min(1, "Informe sua senha")
    .max(TAMANHO_MAXIMO_SENHA, `Use no máximo ${TAMANHO_MAXIMO_SENHA} caracteres`),
});

export type DadosFormularioLogin = z.infer<typeof esquemaLogin>;
