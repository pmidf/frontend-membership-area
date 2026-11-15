import type { TipoConteudo } from "../tipos/conteudo";

export const rotulosTipo: Record<TipoConteudo, string> = {
  VIDEO: "Vídeo",
  MATERIAL: "Material",
};

export const capasPorTipo: Record<TipoConteudo, string> = {
  VIDEO: "from-violeta-800 to-violeta-500",
  MATERIAL: "from-aqua-600 to-acao-destaque",
};
