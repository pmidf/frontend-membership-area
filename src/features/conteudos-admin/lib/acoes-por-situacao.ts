import type { AcaoPublicacao } from "@/shared/publicacao/AcoesPublicacao";
import type { SituacaoPublicacao } from "@/shared/publicacao/situacao";

const acoes: Record<SituacaoPublicacao, AcaoPublicacao[]> = {
  RASCUNHO: ["salvar", "publicar", "arquivar"],
  PUBLICADO: ["salvar", "arquivar"],
  ARQUIVADO: [],
};

export function acoesPorSituacao(situacao: SituacaoPublicacao): AcaoPublicacao[] {
  return acoes[situacao];
}
