export const SITUACOES_QUEBRA_CABECA = ["RASCUNHO", "PUBLICADO", "FORA_DO_AR"] as const;
export type SituacaoQuebraCabeca = (typeof SITUACOES_QUEBRA_CABECA)[number];

export type ItemQuebraCabecaAdmin = {
  id_quebra_cabeca: string;
  nome: string;
  situacao: SituacaoQuebraCabeca;
  total_pecas: number;
  em_andamento: number;
  concluidos: number;
};

export type CriarQuebraCabeca = {
  nome: string;
  legenda: string;
  historia: string;
  imagem_original: string;
  recortes: string[];
};

export type QuebraCabecaCriado = {
  id_quebra_cabeca: string;
  nome: string;
  legenda: string;
  historia: string;
  imagem_original: string;
  situacao: SituacaoQuebraCabeca;
};

export type EditarQuebraCabeca = Partial<CriarQuebraCabeca>;

export type QuebraCabecaAdmin = {
  id_quebra_cabeca: string;
  nome: string;
  legenda: string;
  historia: string;
  imagem_original: string;
  situacao: SituacaoQuebraCabeca;
  pecas: { id_peca: string; indice: number; recorte: string }[];
  pode_trocar_imagem: boolean;
};

export type LinhaRanking = {
  pessoa_id: string;
  concluidos: number;
  total_publicados: number;
  pecas_atual: number;
};
