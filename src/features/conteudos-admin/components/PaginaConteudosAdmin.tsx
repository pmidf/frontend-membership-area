"use client";

import Link from "next/link";
import { useState } from "react";

import { useCategoriasConteudo } from "@/features/conteudos/api/conteudos.queries";
import { useCorrigirPaginaInexistente } from "@/shared/hooks/useCorrigirPaginaInexistente";
import { useParametrosUrl } from "@/shared/hooks/useParametrosUrl";
import {
  Botao,
  CabecalhoPagina,
  Cartao,
  cn,
  EstadoErro,
  EstadoVazio,
  Paginacao,
} from "@/shared/ui";
import { classesBotao } from "@/shared/ui/botao/Botao";

import { useConteudosAdmin } from "../api/conteudos-admin.queries";
import { consultaDaLista, filtrosDaUrl, temFiltroAplicado } from "../lib/filtros-url";
import { FiltrosConteudosAdmin } from "./FiltrosConteudosAdmin";
import { IndicadoresConteudos } from "./IndicadoresConteudos";
import { ModalCategorias } from "./ModalCategorias";
import { TabelaConteudosAdmin } from "./TabelaConteudosAdmin";

const CAMPOS_DE_FILTRO = { q: null, situacao: null, tipo: null, categoria: null, pagina: null };

export function PaginaConteudosAdmin() {
  const { parametros, atualizar } = useParametrosUrl();
  const filtros = filtrosDaUrl(parametros);
  const conteudos = useConteudosAdmin(consultaDaLista(filtros));
  const categorias = useCategoriasConteudo();
  const [limpezas, setLimpezas] = useState(0);
  const [gerenciandoCategorias, setGerenciandoCategorias] = useState(false);
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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Conteúdo"
        subtitulo="Vídeos do capítulo, materiais de apoio e curadoria de links do PMI Global."
        acoes={
          <>
            <Botao variante="secundario" onClick={() => setGerenciandoCategorias(true)}>
              Gerenciar categorias
            </Botao>
            <Link href="/admin/conteudos/novo" className={classesBotao()}>
              + Adicionar conteúdo
            </Link>
          </>
        }
      />
      <IndicadoresConteudos />
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
      <ModalCategorias
        aberto={gerenciandoCategorias}
        aoFechar={() => setGerenciandoCategorias(false)}
      />
    </div>
  );
}
