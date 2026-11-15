"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { Esqueleto, Tabela, type ColunaTabela } from "@/shared/ui";

import type { NomeNoRanking } from "../api/ranking.queries";
import { TOTAL_RECORTES } from "../schemas/quebra-cabeca.schema";
import type { LinhaRanking } from "../tipos/quebra-cabeca-admin";

const MEDALHAS = ["🥇", "🥈", "🥉"];

type LinhaComPosicao = LinhaRanking & { posicao: number };

function Posicao({ posicao }: { posicao: number }) {
  const medalha = MEDALHAS[posicao - 1];
  return (
    <span className="inline-flex items-center gap-1 font-bold text-texto-marca">
      {medalha && (
        <span role="img" aria-label={`${posicao}º lugar`}>
          {medalha}
        </span>
      )}
      <span aria-hidden={medalha ? true : undefined}>{posicao}</span>
    </span>
  );
}

function Nome({ id, nome }: { id: string; nome: NomeNoRanking | undefined }) {
  if (!nome || nome.estado === "carregando") {
    return <Esqueleto variante="linha" rotulo="Carregando o nome…" className="w-40" />;
  }
  if (nome.estado === "removida") {
    return <span className="text-texto-secundario italic">Pessoa removida</span>;
  }
  const texto = nome.estado === "encontrado" ? nome.nome : "Nome indisponível";
  return (
    <Link
      href={`/admin/pessoas/${id}`}
      className="font-medium text-texto-primario underline-offset-4 hover:text-texto-marca hover:underline focus-visible:outline-2 focus-visible:outline-acao-destaque"
    >
      {texto}
    </Link>
  );
}

type PropsTabelaRanking = {
  linhas: LinhaRanking[];
  nomes: Record<string, NomeNoRanking>;
  carregando: boolean;
  vazio: ReactNode;
};

function colunas(nomes: Record<string, NomeNoRanking>): ColunaTabela<LinhaComPosicao>[] {
  return [
    {
      id: "posicao",
      cabecalho: "#",
      largura: "w-20",
      celula: ({ posicao }) => <Posicao posicao={posicao} />,
    },
    {
      id: "nome",
      cabecalho: "Nome",
      celula: ({ pessoa_id }) => <Nome id={pessoa_id} nome={nomes[pessoa_id]} />,
    },
    {
      id: "completos",
      cabecalho: "Completos / total",
      celula: ({ concluidos, total_publicados }) => `${concluidos} / ${total_publicados}`,
    },
    {
      id: "atual",
      cabecalho: `Peças do atual / ${TOTAL_RECORTES}`,
      celula: ({ pecas_atual }) => `${pecas_atual} / ${TOTAL_RECORTES}`,
    },
  ];
}

export function TabelaRanking({ linhas, nomes, carregando, vazio }: PropsTabelaRanking) {
  return (
    <Tabela
      rotulo="Ranking dos filiados mais engajados"
      colunas={colunas(nomes)}
      itens={linhas.map((linha, indice) => ({ ...linha, posicao: indice + 1 }))}
      chave={(linha) => linha.pessoa_id}
      carregando={carregando}
      vazio={vazio}
    />
  );
}
