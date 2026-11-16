import type { Tom } from "@/shared/ui";

import type { SituacaoQuebraCabeca } from "../tipos/quebra-cabeca-admin";

export type AcaoQuebraCabeca = "editar" | "publicar" | "tirar-do-ar" | "subir-novamente";

const acoes: Record<SituacaoQuebraCabeca, AcaoQuebraCabeca[]> = {
  RASCUNHO: ["editar", "publicar"],
  PUBLICADO: ["editar", "tirar-do-ar"],
  FORA_DO_AR: ["editar", "subir-novamente"],
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
