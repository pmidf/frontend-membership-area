"use client";

import { useState } from "react";

import { useCorrigirPaginaInexistente } from "@/shared/hooks/useCorrigirPaginaInexistente";
import { Alerta, Botao, Cartao, cn, EstadoVazio, Paginacao } from "@/shared/ui";

import type { FiltrosVagas as Filtros } from "../lib/filtros-url";
import { textoVagasAbertas } from "../lib/rotulos";
import type { ListaOportunidades } from "../tipos/oportunidade";
import { FiltrosVagas } from "./FiltrosVagas";
import { LinhaVaga } from "./LinhaVaga";

type PropsListaVagas = {
  lista: ListaOportunidades;
  filtros: Filtros;
  consultaAtual: string;
  atualizando: boolean;
  aoMudar: (novos: Record<string, string | number | null>) => void;
};

export function ListaVagas({
  lista,
  filtros,
  consultaAtual,
  atualizando,
  aoMudar,
}: PropsListaVagas) {
  const [limpezas, setLimpezas] = useState(0);
  const temFiltro = filtros.q !== "" || filtros.modalidade !== "";
  const alfabetica = filtros.ordenar === "alfabetica";

  useCorrigirPaginaInexistente(
    !atualizando && lista.itens.length === 0 && filtros.pagina > 1,
    lista.total_paginas,
    aoMudar,
  );

  function limparFiltros() {
    setLimpezas((atual) => atual + 1);
    aoMudar({ q: null, modalidade: null, pagina: null });
  }

  return (
    <>
      <FiltrosVagas
        key={limpezas}
        modalidade={filtros.modalidade}
        valorInicialBusca={limpezas === 0 ? filtros.q : ""}
        aoBuscar={(termo) => aoMudar({ q: termo.trim(), pagina: null })}
        aoFiltrarModalidade={(modalidade) => aoMudar({ modalidade, pagina: null })}
      />
      <Alerta tom="informacao" titulo="O capítulo divulga, não recruta">
        A candidatura acontece direto com a empresa. O PMI-DF não participa do processo seletivo nem
        recebe currículos.
      </Alerta>
      <Cartao
        aria-busy={atualizando}
        className={cn(
          "flex flex-col gap-4 p-4 transition-opacity md:p-6",
          atualizando && "opacity-60",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-h3">{textoVagasAbertas(lista.total)}</h2>
          {lista.total > 1 && (
            <Botao
              variante="link"
              tamanho="sm"
              onClick={() => aoMudar({ ordenar: alfabetica ? null : "alfabetica", pagina: null })}
            >
              {alfabetica ? "Mais recentes primeiro" : "Ver em ordem alfabética"}
            </Botao>
          )}
        </div>
        {lista.itens.length === 0 ? (
          <EstadoVazio
            titulo={temFiltro ? "Nenhuma vaga encontrada" : "Nenhuma vaga aberta no momento"}
            descricao={
              temFiltro
                ? "Tente outro termo ou outra modalidade."
                : "Novas oportunidades aparecem aqui assim que forem publicadas."
            }
            acao={
              temFiltro && (
                <Botao variante="secundario" tamanho="sm" onClick={limparFiltros}>
                  Limpar filtros
                </Botao>
              )
            }
          />
        ) : (
          <ul aria-label="Vagas abertas" className="flex flex-col gap-3">
            {lista.itens.map((vaga) => (
              <LinhaVaga key={vaga.id_oportunidade} vaga={vaga} consultaAtual={consultaAtual} />
            ))}
          </ul>
        )}
        <Paginacao
          pagina={filtros.pagina}
          totalPaginas={lista.total_paginas}
          aoMudar={(destino) => aoMudar({ pagina: destino > 1 ? destino : null })}
        />
      </Cartao>
    </>
  );
}
