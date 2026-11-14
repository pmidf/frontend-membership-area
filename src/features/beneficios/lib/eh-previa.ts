import type { PreviaBeneficios, RespostaBeneficios } from "../tipos/beneficio";

export function ehPrevia(resposta: RespostaBeneficios): resposta is PreviaBeneficios {
  return !("categorias" in resposta);
}
