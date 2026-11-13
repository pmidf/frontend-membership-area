"use client";

import { useCorrigirPaginaInexistente } from "@/shared/hooks/useCorrigirPaginaInexistente";
import { useParametrosUrl } from "@/shared/hooks/useParametrosUrl";
import { paginaDaUrl } from "@/shared/lib/pagina-da-url";
import { CabecalhoPagina, EstadoVazio, Paginacao } from "@/shared/ui";

import { useCatalogoCompleto, useEhPrevia } from "../api/conteudos.queries";
import { conteudosAssistidos } from "../lib/resumo-catalogo";
import { EstadosCatalogo } from "./EstadosCatalogo";
import { GradeConteudos } from "./GradeConteudos";
import { LinkVoltarCatalogo } from "./LinkVoltarCatalogo";

const ITENS_POR_PAGINA = 20;

export function PaginaHistorico() {
  const { parametros, atualizar } = useParametrosUrl();
  const previa = useEhPrevia();
  const catalogo = useCatalogoCompleto();
  const pagina = paginaDaUrl(parametros.get("pagina"));
  const assistidos = conteudosAssistidos(catalogo.data ?? []);
  const totalPaginas = Math.ceil(assistidos.length / ITENS_POR_PAGINA);

  useCorrigirPaginaInexistente(
    catalogo.data !== undefined && pagina > 1 && pagina > totalPaginas,
    totalPaginas,
    atualizar,
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <LinkVoltarCatalogo />
      <CabecalhoPagina
        titulo="Histórico"
        subtitulo={
          previa
            ? "Conteúdos públicos que você já assistiu. Filie-se ao PMI-DF para liberar o restante."
            : "Conteúdos que você já assistiu."
        }
      />
      {catalogo.data &&
        (assistidos.length === 0 ? (
          <EstadoVazio titulo="Você ainda não assistiu a nenhum conteúdo" />
        ) : (
          <GradeConteudos
            itens={assistidos.slice((pagina - 1) * ITENS_POR_PAGINA, pagina * ITENS_POR_PAGINA)}
          />
        ))}
      <Paginacao
        pagina={pagina}
        totalPaginas={totalPaginas}
        aoMudar={(destino) => atualizar({ pagina: destino > 1 ? destino : null })}
      />
      <EstadosCatalogo
        carregando={catalogo.isPending}
        falhou={catalogo.isError}
        aoTentarNovamente={() => void catalogo.refetch()}
      />
    </div>
  );
}
