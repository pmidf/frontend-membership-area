"use client";

import { useParametrosUrl } from "@/shared/hooks/useParametrosUrl";
import { CabecalhoPagina } from "@/shared/ui";

import { useCatalogo, useCategoriasConteudo, useEhPrevia } from "../api/conteudos.queries";
import { filtrosDaUrl, filtrosParaApi } from "../lib/filtros-url";
import { CatalogoConteudos } from "./CatalogoConteudos";
import { EstadosCatalogo } from "./EstadosCatalogo";
import { LinkVoltarCatalogo } from "./LinkVoltarCatalogo";
import { PainelPreviaConteudos } from "./PainelPreviaConteudos";

const SUBTITULO = "Todos os conteúdos publicados, organizados por categoria.";

export function PaginaBiblioteca() {
  const { parametros, atualizar } = useParametrosUrl();
  const previa = useEhPrevia();
  const filtros = filtrosDaUrl(parametros);
  const catalogo = useCatalogo(filtrosParaApi(filtros));
  const categorias = useCategoriasConteudo();
  const { data } = catalogo;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <LinkVoltarCatalogo />
      <CabecalhoPagina
        titulo="Biblioteca completa"
        subtitulo={
          previa
            ? `${SUBTITULO} Os exclusivos ficam liberados para quem é filiado ao PMI-DF.`
            : SUBTITULO
        }
      />
      {previa && <PainelPreviaConteudos />}
      {data && (
        <CatalogoConteudos
          catalogo={data}
          categorias={categorias.data ?? []}
          filtros={filtros}
          atualizando={catalogo.isPlaceholderData}
          aoMudar={atualizar}
        />
      )}
      <EstadosCatalogo
        carregando={catalogo.isPending}
        falhou={catalogo.isError && !data}
        aoTentarNovamente={() => void catalogo.refetch()}
      />
    </div>
  );
}
