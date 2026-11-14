import { z } from "zod";

import {
  camposDadosPessoais,
  esquemaDataNascimento,
  IDADE_MINIMA,
} from "@/features/auth/schemas/cadastro.schema";

export const esquemaPerfil = z.object({
  ...camposDadosPessoais,
  data_nascimento: esquemaDataNascimento(`É preciso ter ${IDADE_MINIMA} anos ou mais`),
});

export type DadosPerfil = z.input<typeof esquemaPerfil>;
