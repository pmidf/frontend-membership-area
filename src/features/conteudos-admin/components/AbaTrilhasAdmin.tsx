"use client";

import { useState } from "react";

import { TAMANHO_MAXIMO_BUSCA } from "@/features/conteudos/lib/filtros-url";
import { useCorrigirPaginaInexistente } from "@/shared/hooks/useCorrigirPaginaInexistente";
import { useParametrosUrl } from "@/shared/hooks/useParametrosUrl";
import { opcoesSituacao } from "@/shared/publicacao/situacao";
import {
  Botao,
  CampoBusca,
  CampoSelecao,
  Cartao,
  cn,
  EstadoErro,
  EstadoVazio,
  Paginacao,
} from "@/shared/ui";

import { useTotalTrilhas, useTrilhasAdmin } from "../api/trilhas-admin.queries";
import { consultaDasTrilhas, filtrosTrilhasDaUrl } from "../lib/filtros-trilhas";
import { IndicadoresSituacao } from "./IndicadoresSituacao";
import { TabelaTrilhasAdmin } from "./TabelaTrilhasAdmin";

export function AbaTrilhasAdmin() {
  const { parametros, atualizar } = useParametrosUrl();
  const filtros = filtrosTrilhasDaUrl(parametros);
  const trilhas = useTrilhasAdmin(consultaDasTrilhas(filtros));
  const [limpezas, setLimpezas] = useState(0);
  const { data, isPlaceholderData } = trilhas;
  const ultimaPagina = data?.total_paginas ?? 0;
  const comFiltro = Boolean(filtros.q || filtros.situacao);

  useCorrigirPaginaInexistente(
    data !== undefined && !isPlaceholderData && data.itens.length === 0 && filtros.pagina > 1,
    ultimaPagina,
    atualizar,
  );

  function limparFiltros() {
    setLimpezas((atual) => atual + 1);
    atualizar({ q: null, situacao: null, pagina: null });
  }

  return (
    <>
      <IndicadoresSituacao rotuloPublicados="Trilhas publicadas" useTotal={useTotalTrilhas} />
      <Cartao className="flex flex-col gap-5 p-4 md:p-6">
        <h2 className="text-h3">Trilhas</h2>
        <div
          key={limpezas}
          className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] sm:items-end"
        >
          <CampoBusca
            rotulo="Buscar trilha"
            placeholder="Buscar por título ou descrição"
            valorInicial={limpezas === 0 ? filtros.q : ""}
            maxLength={TAMANHO_MAXIMO_BUSCA}
            aoBuscar={(termo) => atualizar({ q: termo.trim(), pagina: null })}
            className="sm:mb-1.5"
          />
          <CampoSelecao
            rotulo="Status"
            opcoes={opcoesSituacao}
            textoVazio="Todos"
            value={filtros.situacao}
            onChange={(evento) => atualizar({ situacao: evento.target.value, pagina: null })}
          />
        </div>
        {trilhas.isError && !data ? (
          <EstadoErro
            compacto
            mensagem="Não foi possível carregar as trilhas."
            aoTentarNovamente={() => void trilhas.refetch()}
          />
        ) : (
          <div
            aria-busy={isPlaceholderData}
            className={cn("transition-opacity", isPlaceholderData && "opacity-60")}
          >
            <TabelaTrilhasAdmin
              trilhas={data?.itens ?? []}
              carregando={trilhas.isPending}
              consultaAtual={parametros.toString()}
              vazio={
                <EstadoVazio
                  titulo={comFiltro ? "Nenhuma trilha encontrada" : "Nenhuma trilha criada ainda"}
                  acao={
                    comFiltro && (
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
