import type { PreviaOportunidades, RespostaOportunidades } from "../tipos/oportunidade";

export function ehPrevia(resposta: RespostaOportunidades): resposta is PreviaOportunidades {
  return !("pagina" in resposta);
}
