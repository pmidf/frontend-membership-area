"use client";

import { useState } from "react";

import { useCategoriasConteudo } from "@/features/conteudos/api/conteudos.queries";
import { useCorrigirPaginaInexistente } from "@/shared/hooks/useCorrigirPaginaInexistente";
import { useParametrosUrl } from "@/shared/hooks/useParametrosUrl";
import { Botao, Cartao, cn, EstadoErro, EstadoVazio, Paginacao } from "@/shared/ui";

import { useConteudosAdmin, useTotalConteudos } from "../api/conteudos-admin.queries";
import { consultaDaLista, filtrosDaUrl, temFiltroAplicado } from "../lib/filtros-url";
import { FiltrosConteudosAdmin } from "./FiltrosConteudosAdmin";
import { IndicadoresSituacao } from "./IndicadoresSituacao";
import { TabelaConteudosAdmin } from "./TabelaConteudosAdmin";

const CAMPOS_DE_FILTRO = { q: null, situacao: null, tipo: null, categoria: null, pagina: null };

export function AbaConteudosAdmin() {
  const { parametros, atualizar } = useParametrosUrl();
  const filtros = filtrosDaUrl(parametros);
  const conteudos = useConteudosAdmin(consultaDaLista(filtros));
  const categorias = useCategoriasConteudo();
  const [limpezas, setLimpezas] = useState(0);
  const { data, isPlaceholderData } = conteudos;
  const ultimaPagina = data?.total_paginas ?? 0;

  useCorrigirPaginaInexistente(
    data !== undefined && !isPlaceholderData && data.itens.length === 0 && filtros.pagina > 1,
    ultimaPagina,
    atualizar,
  );

  function limparFiltros() {
    setLimpezas((atual) => atual + 1);
    atualizar(CAMPOS_DE_FILTRO);
  }

  return (
    <>
      <IndicadoresSituacao rotuloPublicados="Publicados" useTotal={useTotalConteudos} />
      <Cartao className="flex flex-col gap-5 p-4 md:p-6">
        <h2 className="text-h3">Biblioteca</h2>
        <FiltrosConteudosAdmin
          key={limpezas}
          filtros={filtros}
          categorias={categorias.data ?? []}
          valorInicialBusca={limpezas === 0 ? filtros.q : ""}
          aoBuscar={(termo) => atualizar({ q: termo.trim(), pagina: null })}
          aoFiltrar={(campo, valor) => atualizar({ [campo]: valor, pagina: null })}
        />
        {conteudos.isError && !data ? (
          <EstadoErro
            compacto
            mensagem="Não foi possível carregar os conteúdos."
            aoTentarNovamente={() => void conteudos.refetch()}
          />
        ) : (
          <div
            aria-busy={isPlaceholderData}
            className={cn("transition-opacity", isPlaceholderData && "opacity-60")}
          >
            <TabelaConteudosAdmin
              conteudos={data?.itens ?? []}
              carregando={conteudos.isPending}
              consultaAtual={parametros.toString()}
              vazio={
                <EstadoVazio
                  titulo="Nenhum conteúdo encontrado"
                  acao={
                    temFiltroAplicado(filtros) && (
                      <Botao variante="secundario" tamanho="sm" onClick={limparFiltros}>
                        Limpar filtros
                      </Botao>
                    )
                  }
                />
              }
            />
          </div>
        )}
        <Paginacao
          pagina={filtros.pagina}
          totalPaginas={ultimaPagina}
          aoMudar={(destino) => atualizar({ pagina: destino > 1 ? destino : null })}
        />
      </Cartao>
    </>
  );
}
