import { z } from "zod";

import { esquemaSenhaInformada } from "@/shared/senha/regras-senha";

export const esquemaLogin = z.object({
  email: z.string().trim().min(1, "Informe seu e-mail").pipe(z.email("Informe um e-mail válido")),
  senha: esquemaSenhaInformada("Informe sua senha"),
});

export type DadosFormularioLogin = z.infer<typeof esquemaLogin>;
