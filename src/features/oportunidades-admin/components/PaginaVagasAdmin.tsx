"use client";

import Link from "next/link";
import { useState } from "react";

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

import { useOportunidadesAdmin } from "../api/oportunidades-admin.queries";
import { CAMINHO_VAGAS_ADMIN } from "../lib/caminhos";
import { consultaDaLista, filtrosDaUrl, temFiltroAplicado } from "../lib/filtros-url";
import { useAcoesVaga } from "../lib/useAcoesVaga";
import type { ItemOportunidadeAdmin } from "../tipos/oportunidade-admin";
import { DialogoEncerrarVaga } from "./DialogoEncerrarVaga";
import { FiltrosVagasAdmin } from "./FiltrosVagasAdmin";
import { TabelaVagasAdmin } from "./TabelaVagasAdmin";

export function PaginaVagasAdmin() {
  const { parametros, atualizar } = useParametrosUrl();
  const filtros = filtrosDaUrl(parametros);
  const vagas = useOportunidadesAdmin(consultaDaLista(filtros));
  const acoes = useAcoesVaga();
  const [limpezas, setLimpezas] = useState(0);
  const [encerrando, setEncerrando] = useState<ItemOportunidadeAdmin | null>(null);
  const { data, isPlaceholderData } = vagas;
  const ultimaPagina = data?.total_paginas ?? 0;

  useCorrigirPaginaInexistente(
    data !== undefined && !isPlaceholderData && data.itens.length === 0 && filtros.pagina > 1,
    ultimaPagina,
    atualizar,
  );

  function limparFiltros() {
    setLimpezas((atual) => atual + 1);
    atualizar({ q: null, situacao: null, pagina: null });
  }

  async function encerrar(motivo: string | undefined) {
    if (!encerrando) return;
    await acoes.encerrar(encerrando.id_oportunidade, motivo);
    setEncerrando(null);
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Gerenciar vagas"
        subtitulo="Cadastre, edite e encerre as vagas divulgadas aos filiados."
        acoes={
          <Link href={`${CAMINHO_VAGAS_ADMIN}/nova`} className={classesBotao()}>
            + Nova vaga
          </Link>
        }
      />
      <FiltrosVagasAdmin
        key={limpezas}
        situacao={filtros.situacao}
        valorInicialBusca={limpezas === 0 ? filtros.q : ""}
        aoBuscar={(termo) => atualizar({ q: termo.trim(), pagina: null })}
        aoFiltrarSituacao={(situacao) => atualizar({ situacao, pagina: null })}
      />
      <Cartao className="flex flex-col gap-5 p-4 md:p-6">
        {vagas.isError && !data ? (
          <EstadoErro
            compacto
            mensagem="Não foi possível carregar as vagas."
            aoTentarNovamente={() => void vagas.refetch()}
          />
        ) : (
          <div
            aria-busy={isPlaceholderData}
            className={cn("transition-opacity", isPlaceholderData && "opacity-60")}
          >
            <TabelaVagasAdmin
              vagas={data?.itens ?? []}
              carregando={vagas.isPending}
              consultaAtual={parametros.toString()}
              ocupado={acoes.ocupado}
              aoPublicar={(vaga) => void acoes.publicar(vaga.id_oportunidade)}
              aoEncerrar={setEncerrando}
              aoDuplicar={(vaga) => void acoes.duplicar(vaga.id_oportunidade)}
              vazio={
                temFiltroAplicado(filtros) ? (
                  <EstadoVazio
                    titulo="Nenhuma vaga encontrada"
                    descricao="Tente outro termo ou outro status."
                    acao={
                      <Botao variante="secundario" tamanho="sm" onClick={limparFiltros}>
                        Limpar filtros
                      </Botao>
                    }
                  />
                ) : (
                  <EstadoVazio
                    titulo="Nenhuma vaga cadastrada"
                    descricao="Cadastre a primeira vaga para divulgá-la aos filiados."
                  />
                )
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
      <DialogoEncerrarVaga
        titulo={encerrando?.titulo ?? null}
        carregando={acoes.encerrando}
        aoFechar={() => setEncerrando(null)}
        aoConfirmar={(motivo) => void encerrar(motivo)}
      />
    </div>
  );
}
