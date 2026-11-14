"use client";

import { useEffect } from "react";

import { useParametrosUrl } from "@/shared/hooks/useParametrosUrl";
import { paginaDaUrl } from "@/shared/lib/pagina-da-url";
import {
  CabecalhoPagina,
  CampoBusca,
  Cartao,
  cn,
  EstadoErro,
  EstadoVazio,
  Paginacao,
} from "@/shared/ui";

import { usePessoas } from "../api/pessoas-admin.queries";
import { IndicadorTotalPessoas } from "./IndicadorTotalPessoas";
import { TabelaPessoas } from "./TabelaPessoas";

const TAMANHO_MINIMO_BUSCA = 3;
const TAMANHO_MAXIMO_BUSCA = 150;

export function PaginaPessoas() {
  const { parametros, atualizar } = useParametrosUrl();
  const busca = (parametros.get("busca") ?? "").trim().slice(0, TAMANHO_MAXIMO_BUSCA);
  const pagina = paginaDaUrl(parametros.get("pagina"));
  const pessoas = usePessoas({ busca, pagina });
  const { data, isPlaceholderData } = pessoas;

  const passouDoFim =
    data !== undefined && !isPlaceholderData && data.itens.length === 0 && pagina > 1;
  const ultimaPagina = data?.total_paginas ?? 0;

  useEffect(() => {
    if (passouDoFim) atualizar({ pagina: ultimaPagina > 1 ? ultimaPagina : null });
  }, [passouDoFim, ultimaPagina, atualizar]);

  function aoBuscar(termo: string) {
    const aparado = termo.trim();
    if (aparado.length > 0 && aparado.length < TAMANHO_MINIMO_BUSCA) return;
    atualizar({ busca: aparado, pagina: null });
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Pessoas"
        subtitulo="Base de pessoas cadastradas na plataforma do PMI-DF."
      />
      <IndicadorTotalPessoas />
      <Cartao className="flex flex-col gap-5 p-4 md:p-6">
        <CampoBusca
          rotulo="Buscar por nome, e-mail ou PMI ID"
          placeholder="Buscar por nome, e-mail ou PMI ID"
          valorInicial={busca}
          maxLength={TAMANHO_MAXIMO_BUSCA}
          aoBuscar={aoBuscar}
        />
        {pessoas.isError && !data ? (
          <EstadoErro
            compacto
            mensagem="Não foi possível carregar as pessoas."
            aoTentarNovamente={() => void pessoas.refetch()}
          />
        ) : (
          <div
            aria-busy={isPlaceholderData}
            className={cn("transition-opacity", isPlaceholderData && "opacity-60")}
          >
            <TabelaPessoas
              pessoas={data?.itens ?? []}
              carregando={pessoas.isPending}
              consultaAtual={parametros.toString()}
              vazio={
                <EstadoVazio
                  titulo={
                    busca
                      ? `Nenhuma pessoa encontrada para '${busca}'`
                      : "Nenhuma pessoa encontrada"
                  }
                />
              }
            />
          </div>
        )}
        <Paginacao
          pagina={pagina}
          totalPaginas={ultimaPagina}
          aoMudar={(destino) => atualizar({ pagina: destino > 1 ? destino : null })}
        />
      </Cartao>
    </div>
  );
}
