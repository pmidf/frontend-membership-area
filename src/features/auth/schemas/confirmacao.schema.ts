import { z } from "zod";

export const FORMATO_CODIGO = /^\d{6}$/;

export const esquemaEmailConfirmacao = z.object({
  email: z.string().trim().min(1, "Informe seu e-mail").pipe(z.email("Informe um e-mail válido")),
});

export type DadosEmailConfirmacao = z.infer<typeof esquemaEmailConfirmacao>;
