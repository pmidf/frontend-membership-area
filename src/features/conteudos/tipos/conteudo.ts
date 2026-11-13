export type TipoConteudo = "VIDEO" | "MATERIAL";

export type ItemCatalogoCompleto = {
  id_conteudo: string;
  titulo: string;
  descricao: string;
  tipo: TipoConteudo;
  duracao_segundos: number | null;
  data_publicacao: string | null;
  bol_exclusivo: boolean;
  consumido: boolean;
  data_consumo: string | null;
  bloqueado: false;
};

export type ItemCatalogoPrevia = {
  id_conteudo: string;
  titulo: string;
  tipo: TipoConteudo;
  data_publicacao: string | null;
  bol_exclusivo: true;
  bloqueado: true;
};

export type ItemCatalogo = ItemCatalogoCompleto | ItemCatalogoPrevia;

export type GrupoCatalogo = {
  cod_categoria: string;
  desc_categoria: string;
  itens: ItemCatalogo[];
};

export type Catalogo = {
  total: number;
  total_publicados: number;
  pagina: number;
  total_paginas: number;
  categorias: GrupoCatalogo[];
};

export type CategoriaConteudo = {
  cod_categoria: string;
  desc_categoria: string;
  ordem: number;
};

export type FiltrosConteudos = {
  q?: string;
  categoria?: string;
  tipo?: TipoConteudo;
  page?: number;
};

export type CategoriaResumo = { cod_categoria: string; desc_categoria: string };

export type ConteudoAcessivel = ItemCatalogoCompleto & { categoria: CategoriaResumo };

export type DetalheConteudo =
  ConteudoAcessivel | (ItemCatalogoPrevia & { categoria: CategoriaResumo });

export type PlayerConteudo = { video_id: string; embed_url: string };

export type AcessoMaterial = { url: string };
