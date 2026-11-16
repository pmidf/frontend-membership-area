import type { SituacaoOportunidade } from "@/features/oportunidades/tipos/oportunidade";

export type AcaoLinha = "publicar" | "encerrar" | "duplicar" | "editar";
export type AcaoEdicao = "publicar" | "previsualizar" | "salvar" | "encerrar" | "duplicar";

const acoesLinha: Record<SituacaoOportunidade, AcaoLinha[]> = {
  RASCUNHO: ["publicar", "duplicar", "editar"],
  PUBLICADA: ["encerrar", "duplicar", "editar"],
  ENCERRADA: ["duplicar"],
};

const acoesEdicao: Record<SituacaoOportunidade, AcaoEdicao[]> = {
  RASCUNHO: ["publicar", "previsualizar", "salvar", "duplicar"],
  PUBLICADA: ["salvar", "previsualizar", "encerrar", "duplicar"],
  ENCERRADA: ["duplicar"],
};

export const ACOES_NOVA_VAGA: AcaoEdicao[] = ["publicar", "previsualizar", "salvar"];

export function acoesDaLinha(situacao: SituacaoOportunidade): AcaoLinha[] {
  return acoesLinha[situacao];
}

export function acoesDaEdicao(situacao: SituacaoOportunidade): AcaoEdicao[] {
  return acoesEdicao[situacao];
}
