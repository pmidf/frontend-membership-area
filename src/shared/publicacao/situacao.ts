import type { Tom } from "@/shared/ui";

export const SITUACOES_PUBLICACAO = ["RASCUNHO", "PUBLICADO", "ARQUIVADO"] as const;
export type SituacaoPublicacao = (typeof SITUACOES_PUBLICACAO)[number];

export const rotulosSituacao: Record<SituacaoPublicacao, { rotulo: string; tom: Tom }> = {
  RASCUNHO: { rotulo: "Rascunho", tom: "neutro" },
  PUBLICADO: { rotulo: "Publicado", tom: "aqua" },
  ARQUIVADO: { rotulo: "Arquivado", tom: "alerta" },
};

export const opcoesSituacao = SITUACOES_PUBLICACAO.map((valor) => ({
  valor,
  rotulo: rotulosSituacao[valor].rotulo,
}));
