import { TOTAL_PECAS, type PecaObtida } from "../tipos/gamificacao";

export const COLUNAS_TABULEIRO = 4;
export const LINHAS_TABULEIRO = 2;

export type PosicaoTabuleiro = { linha: number; coluna: number };

export function posicaoDoIndice(indice: number): PosicaoTabuleiro | null {
  if (!Number.isInteger(indice) || indice < 0 || indice >= TOTAL_PECAS) return null;
  return { linha: Math.floor(indice / COLUNAS_TABULEIRO), coluna: indice % COLUNAS_TABULEIRO };
}

export function recortesPorIndice(pecas: PecaObtida[]): (string | null)[] {
  const recortes: (string | null)[] = Array.from({ length: TOTAL_PECAS }, () => null);
  for (const { indice, recorte } of pecas) {
    if (posicaoDoIndice(indice)) recortes[indice] = recorte;
  }
  return recortes;
}
