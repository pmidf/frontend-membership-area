import type { Tom } from "@/shared/ui";

import type { Modalidade, SituacaoOportunidade } from "../tipos/oportunidade";

export const rotulosModalidade: Record<Modalidade, { rotulo: string; tom: Tom }> = {
  PRESENCIAL: { rotulo: "Presencial", tom: "violeta" },
  REMOTO: { rotulo: "Remoto", tom: "aqua" },
  HIBRIDO: { rotulo: "Híbrido", tom: "aqua" },
};

export const rotulosSituacaoOportunidade: Record<
  SituacaoOportunidade,
  { rotulo: string; tom: Tom }
> = {
  RASCUNHO: { rotulo: "Rascunho", tom: "neutro" },
  PUBLICADA: { rotulo: "Publicada", tom: "aqua" },
  ENCERRADA: { rotulo: "Encerrada", tom: "alerta" },
};
