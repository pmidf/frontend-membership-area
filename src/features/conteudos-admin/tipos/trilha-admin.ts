import type { TipoConteudo } from "@/features/conteudos/tipos/conteudo";
import type { SituacaoPublicacao } from "@/shared/publicacao/situacao";

export type ItemTrilhaAdmin = {
  id_conteudo: string;
  titulo: string;
  tipo: TipoConteudo;
  situacao: SituacaoPublicacao;
  bol_exclusivo: boolean;
};

export type TrilhaAdmin = {
  id_trilha: string;
  id_pessoa_criou: string;
  titulo: string;
  descricao: string;
  situacao: SituacaoPublicacao;
  data_publicacao: string | null;
  data_criacao: string;
  data_atualizacao: string;
  itens: ItemTrilhaAdmin[];
};

export type CriarTrilha = {
  titulo: string;
  descricao: string;
  ids_conteudos: string[];
};

export type AtualizarTrilha = Partial<CriarTrilha>;

export type ResumoTrilhaAdmin = {
  id_trilha: string;
  titulo: string;
  situacao: SituacaoPublicacao;
  data_publicacao: string | null;
  data_atualizacao: string;
  quantidade_itens: number;
};

export type ConsultaTrilhasAdmin = {
  q?: string;
  situacao?: SituacaoPublicacao;
  page?: number;
};
