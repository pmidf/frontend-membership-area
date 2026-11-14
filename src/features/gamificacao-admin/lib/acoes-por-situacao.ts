import type { Tom } from "@/shared/ui";

import type { SituacaoQuebraCabeca } from "../tipos/quebra-cabeca-admin";

export type AcaoQuebraCabeca = "editar" | "publicar";

const acoes: Record<SituacaoQuebraCabeca, AcaoQuebraCabeca[]> = {
  RASCUNHO: ["editar", "publicar"],
  PUBLICADO: ["editar"],
  FORA_DO_AR: ["editar"],
};

export function acoesPorSituacao(situacao: SituacaoQuebraCabeca): AcaoQuebraCabeca[] {
  return acoes[situacao];
}

export const rotulosSituacaoQuebraCabeca: Record<
  SituacaoQuebraCabeca,
  { rotulo: string; tom: Tom }
> = {
  RASCUNHO: { rotulo: "Rascunho", tom: "neutro" },
  PUBLICADO: { rotulo: "Publicado", tom: "sucesso" },
  FORA_DO_AR: { rotulo: "Fora do ar", tom: "alerta" },
};
