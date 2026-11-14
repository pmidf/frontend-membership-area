import type { PainelGamificacao, PecaSorteadaBase } from "../tipos/gamificacao";

export function aplicarPeca(painel: PainelGamificacao, peca: PecaSorteadaBase): PainelGamificacao {
  const atualizado = { ...painel, creditos: peca.creditos };
  if (!painel.em_andamento) return atualizado;

  const jaTinha = painel.em_andamento.pecas.some(({ indice }) => indice === peca.indice);
  const pecas = jaTinha
    ? painel.em_andamento.pecas
    : [...painel.em_andamento.pecas, { indice: peca.indice, recorte: peca.recorte }].sort(
        (a, b) => a.indice - b.indice,
      );

  return {
    ...atualizado,
    em_andamento: { ...painel.em_andamento, pecas, pecas_obtidas: peca.pecas_obtidas },
  };
}
