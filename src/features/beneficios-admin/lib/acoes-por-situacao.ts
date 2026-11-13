import type { AcaoPublicacao } from "@/shared/publicacao/AcoesPublicacao";

import type { SituacaoBeneficio } from "../tipos/beneficio-admin";

export type AcaoBeneficio = AcaoPublicacao | "duplicar";

const acoes: Record<SituacaoBeneficio, AcaoBeneficio[]> = {
  RASCUNHO: ["salvar", "publicar", "arquivar"],
  PUBLICADO: ["salvar", "despublicar", "arquivar"],
  ARQUIVADO: ["duplicar"],
};

export function acoesPorSituacao(situacao: SituacaoBeneficio): AcaoBeneficio[] {
  return acoes[situacao];
}
