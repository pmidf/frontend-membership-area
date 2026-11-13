import type {
  CategoriaResumo,
  FiltrosConteudos,
  TipoConteudo,
} from "@/features/conteudos/tipos/conteudo";
import type { SituacaoPublicacao } from "@/shared/publicacao/situacao";

export type ConteudoAdmin = {
  id_conteudo: string;
  id_pessoa_publicou: string;
  tipo: TipoConteudo;
  situacao: SituacaoPublicacao;
  cod_categoria: string;
  titulo: string;
  descricao: string;
  url: string;
  bol_exclusivo: boolean;
  duracao_segundos: number | null;
  data_publicacao: string | null;
  data_criacao: string;
  data_atualizacao: string;
  categoria: CategoriaResumo;
};

export type ConsultaConteudosAdmin = FiltrosConteudos & { situacao?: SituacaoPublicacao };

export type CriarConteudo = Pick<
  ConteudoAdmin,
  "titulo" | "descricao" | "tipo" | "url" | "cod_categoria" | "bol_exclusivo"
> & { duracao_segundos?: number };

export type AtualizarConteudo = Partial<
  Pick<
    ConteudoAdmin,
    "titulo" | "descricao" | "url" | "cod_categoria" | "bol_exclusivo" | "duracao_segundos"
  >
>;

export type PreviaYoutube = { video_id: string; embed_url: string };

export type PontoSerie = { dia: string; visualizacoes: number };

export type EstatisticasConteudo = {
  titulo: string;
  tipo: TipoConteudo;
  situacao: SituacaoPublicacao;
  data_publicacao: string | null;
  visualizacoes_totais: number;
  espectadores_unicos: number;
  visualizacoes_recentes: number;
  serie: PontoSerie[];
};

export type AcessoConteudo = { nome: string; cargo: string; empresa: string; data_acesso: string };

export type AcessosConteudo = {
  total_acessos: number;
  total_espectadores: number;
  pagina: number;
  total_paginas: number;
  acessos: AcessoConteudo[];
};

export type PeriodoEstatisticas = { de?: string; ate?: string };
