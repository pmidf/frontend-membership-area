"use client";

import { useEffect, useState } from "react";

import { Botao, cn, EstadoVazio, Paginacao } from "@/shared/ui";

import type { FiltrosCatalogo } from "../lib/filtros-url";
import type { ListaBeneficios } from "../tipos/beneficio";
import { FiltrosBeneficios } from "./FiltrosBeneficios";
import { GradeBeneficios } from "./GradeBeneficios";

type PropsCatalogoBeneficios = {
  lista: ListaBeneficios;
  filtros: FiltrosCatalogo;
  consultaAtual: string;
  atualizando: boolean;
  aoMudar: (novos: Record<string, string | number | null>) => void;
};

function tituloVazio({ q, categoria }: FiltrosCatalogo): string {
  if (q) return `Nenhum benefício encontrado para '${q}'`;
  return categoria ? "Nenhum benefício encontrado" : "Novos benefícios em breve.";
}

export function CatalogoBeneficios({
  lista,
  filtros,
  consultaAtual,
  atualizando,
  aoMudar,
}: PropsCatalogoBeneficios) {
  const [limpezas, setLimpezas] = useState(0);
  const passouDoFim = !atualizando && lista.itens.length === 0 && filtros.pagina > 1;
  const ultimaPagina = lista.total_paginas;

  useEffect(() => {
    if (passouDoFim) aoMudar({ pagina: ultimaPagina > 1 ? ultimaPagina : null });
  }, [passouDoFim, ultimaPagina, aoMudar]);

  function limparFiltros() {
    setLimpezas((atual) => atual + 1);
    aoMudar({ q: null, categoria: null, pagina: null });
  }

  return (
    <>
      <FiltrosBeneficios
        key={limpezas}
        filtros={filtros}
        categorias={lista.categorias}
        valorInicialBusca={limpezas === 0 ? filtros.q : ""}
        aoBuscar={(termo) => aoMudar({ q: termo.trim(), pagina: null })}
        aoEscolherCategoria={(categoria) => aoMudar({ categoria, pagina: null })}
      />
      <div
        aria-busy={atualizando}
        className={cn("transition-opacity", atualizando && "opacity-60")}
      >
        {lista.itens.length === 0 ? (
          <EstadoVazio
            titulo={tituloVazio(filtros)}
            acao={
              (filtros.q || filtros.categoria) && (
                <Botao variante="secundario" tamanho="sm" onClick={limparFiltros}>
                  Limpar filtros
                </Botao>
              )
            }
          />
        ) : (
          <GradeBeneficios itens={lista.itens} consultaAtual={consultaAtual} />
        )}
      </div>
      <Paginacao
        pagina={filtros.pagina}
        totalPaginas={ultimaPagina}
        aoMudar={(destino) => aoMudar({ pagina: destino > 1 ? destino : null })}
      />
    </>
  );
}
