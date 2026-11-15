import type { ItemCatalogo } from "./conteudo";

export type ResumoTrilha = {
  id_trilha: string;
  titulo: string;
  descricao: string;
  data_publicacao: string | null;
  total_itens: number;
  itens_vistos: number;
};

export type TrilhaDoConteudo = ResumoTrilha & {
  posicao: number;
  proximo: ItemCatalogo | null;
};

export type DetalheTrilha = ResumoTrilha & { itens: ItemCatalogo[] };
