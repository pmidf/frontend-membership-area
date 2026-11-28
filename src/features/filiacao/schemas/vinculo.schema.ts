import { z } from "zod";

import { FORMATO_PMI_ID } from "@/features/auth/schemas/cadastro.schema";

export const esquemaVinculo = z.object({
  pmi_id: z.string().trim().regex(FORMATO_PMI_ID, "Informe seu PMI ID (só números)"),
});

export type DadosVinculo = z.infer<typeof esquemaVinculo>;
