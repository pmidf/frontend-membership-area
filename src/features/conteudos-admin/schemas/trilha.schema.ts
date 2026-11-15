import { z } from "zod";

import { SITUACOES_PUBLICACAO } from "@/shared/publicacao/situacao";

export const MAXIMO_ITENS_TRILHA = 100;

const esquemaItem = z.object({
  id_conteudo: z.string(),
  titulo: z.string(),
  tipo: z.enum(["VIDEO", "MATERIAL"]),
  situacao: z.enum(SITUACOES_PUBLICACAO),
  bol_exclusivo: z.boolean(),
});

export const esquemaTrilha = z.object({
  titulo: z.string().trim().min(1, "Informe o título").max(150, "Use no máximo 150 caracteres"),
  descricao: z.string().trim().min(1, "Informe a descrição"),
  itens: z
    .array(esquemaItem)
    .max(MAXIMO_ITENS_TRILHA, `Use no máximo ${MAXIMO_ITENS_TRILHA} conteúdos`),
});

export type DadosTrilha = z.input<typeof esquemaTrilha>;
