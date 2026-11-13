"use client";

import { useRouter } from "next/navigation";

import { CabecalhoPagina, EstadoVazio } from "@/shared/ui";

import { useCatalogoCompleto, useEhPrevia } from "../api/conteudos.queries";
import type { FiltrosCatalogo } from "../lib/filtros-url";
import { conteudosAssistidos, ITENS_POR_SECAO, maisRecentes } from "../lib/resumo-catalogo";
import type { ItemCatalogo } from "../tipos/conteudo";
import { EstadosCatalogo } from "./EstadosCatalogo";
import { FiltrosConteudos } from "./FiltrosConteudos";
import { PainelPreviaConteudos } from "./PainelPreviaConteudos";
import { SecaoResumo } from "./SecaoResumo";

const INICIO_SUBTITULO =
  "Gravações do capítulo, materiais de apoio e a central de conhecimento do PMI Global";
const ATRASO_BUSCA_RESUMO = 700;
const SEM_FILTROS: FiltrosCatalogo = { q: "", tipo: "", categoria: "", pagina: 1 };

function ResumoCatalogo({ itens }: { itens: ItemCatalogo[] }) {
  if (itens.length === 0) return <EstadoVazio titulo="Nenhum conteúdo encontrado" />;
  const assistidos = conteudosAssistidos(itens);

  return (
    <>
      {assistidos.length > 0 && (
        <SecaoResumo
          titulo="Assistidos"
          rotuloLink="Ver histórico"
          href="/conteudos/historico"
          itens={assistidos.slice(0, ITENS_POR_SECAO)}
        />
      )}
      <SecaoResumo
        titulo="Adicionados recentemente"
        rotuloLink="Ver biblioteca completa"
        href="/conteudos/biblioteca"
        itens={maisRecentes(itens).slice(0, ITENS_POR_SECAO)}
      />
    </>
  );
}

export function PaginaConteudos() {
  const roteador = useRouter();
  const previa = useEhPrevia();
  const catalogo = useCatalogoCompleto();

  function irParaBiblioteca(novos: Record<string, string | null>) {
    const consulta = new URLSearchParams(
      Object.entries(novos).filter((par): par is [string, string] => Boolean(par[1])),
    ).toString();
    if (consulta) roteador.push(`/conteudos/biblioteca?${consulta}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Conteúdo exclusivo"
        subtitulo={
          previa
            ? `${INICIO_SUBTITULO} — liberado por completo para quem é filiado ao PMI-DF.`
            : `${INICIO_SUBTITULO}, em um só lugar.`
        }
      />
      {previa && <PainelPreviaConteudos />}
      <FiltrosConteudos
        filtros={SEM_FILTROS}
        atrasoBusca={ATRASO_BUSCA_RESUMO}
        aoMudar={irParaBiblioteca}
      />
      {catalogo.data && <ResumoCatalogo itens={catalogo.data} />}
      <EstadosCatalogo
        carregando={catalogo.isPending}
        falhou={catalogo.isError}
        aoTentarNovamente={() => void catalogo.refetch()}
      />
    </div>
  );
}
