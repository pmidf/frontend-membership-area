export const TOTAL_PECAS = 8;

export type PecaObtida = { indice: number; recorte: string };

export type QuebraCabecaEmAndamento = {
  pecas_obtidas: number;
  total_pecas: number;
  pecas: PecaObtida[];
};

export type QuebraCabecaConcluido = {
  progresso_id: string;
  nome: string;
  legenda: string;
  imagem_original: string;
  concluido_em: string;
};

export type PainelGamificacao = {
  creditos: number;
  em_andamento: QuebraCabecaEmAndamento | null;
  concluidos: QuebraCabecaConcluido[];
};

export type QuebraCabecaSorteado = {
  pecas_obtidas: number;
  total_pecas: number;
  creditos: number;
};

export type DetalheConcluido = {
  nome: string;
  legenda: string;
  historia: string;
  imagem_original: string;
  concluido_em: string;
};
