"use client";

import Link from "next/link";
import { Fragment, type ReactNode } from "react";

import {
  rotulosModalidade,
  rotulosSituacaoOportunidade,
} from "@/features/oportunidades/lib/rotulos";
import { formatarData, formatarDataCivil } from "@/shared/lib/datas";
import { SeloStatus, Tabela, type ColunaTabela } from "@/shared/ui";

import { acoesDaLinha, type AcaoLinha } from "../lib/acoes-por-situacao";
import { caminhoDaVaga } from "../lib/caminhos";
import type { ItemOportunidadeAdmin } from "../tipos/oportunidade-admin";

const classesAcao =
  "text-corpo-pequeno font-medium whitespace-nowrap text-texto-marca underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-acao-destaque disabled:cursor-not-allowed disabled:opacity-60";

const rotulosAcao: Record<AcaoLinha, string> = {
  publicar: "Publicar",
  encerrar: "Encerrar",
  duplicar: "Duplicar",
  editar: "Editar",
};

const SEM_DATA = "—";

type PropsTabelaVagasAdmin = {
  vagas: ItemOportunidadeAdmin[];
  carregando: boolean;
  vazio: ReactNode;
  consultaAtual: string;
  ocupado: boolean;
  aoPublicar: (vaga: ItemOportunidadeAdmin) => void;
  aoEncerrar: (vaga: ItemOportunidadeAdmin) => void;
  aoDuplicar: (vaga: ItemOportunidadeAdmin) => void;
};

function colunas({
  consultaAtual,
  ocupado,
  aoPublicar,
  aoEncerrar,
  aoDuplicar,
}: Omit<
  PropsTabelaVagasAdmin,
  "vagas" | "carregando" | "vazio"
>): ColunaTabela<ItemOportunidadeAdmin>[] {
  const aoClicar = { publicar: aoPublicar, encerrar: aoEncerrar, duplicar: aoDuplicar };

  function renderizarAcao(acao: AcaoLinha, vaga: ItemOportunidadeAdmin) {
    const rotuloAcessivel = `${rotulosAcao[acao]} ${vaga.titulo}`;
    if (acao === "editar") {
      return (
        <Link
          href={caminhoDaVaga(vaga.id_oportunidade, consultaAtual)}
          aria-label={rotuloAcessivel}
          className={classesAcao}
        >
          {rotulosAcao[acao]}
        </Link>
      );
    }
    return (
      <button
        type="button"
        aria-label={rotuloAcessivel}
        disabled={ocupado}
        onClick={() => aoClicar[acao](vaga)}
        className={classesAcao}
      >
        {rotulosAcao[acao]}
      </button>
    );
  }

  return [
    {
      id: "vaga",
      cabecalho: "Vaga",
      celula: ({ id_oportunidade, titulo, empresa }) => (
        <span className="flex flex-col gap-0.5">
          <Link
            href={caminhoDaVaga(id_oportunidade, consultaAtual)}
            className="font-medium break-words underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-acao-destaque"
          >
            {titulo}
          </Link>
          <span className="text-legenda text-texto-secundario">{empresa}</span>
        </span>
      ),
    },
    {
      id: "modalidade",
      cabecalho: "Modalidade",
      celula: ({ modalidade }) => (modalidade ? rotulosModalidade[modalidade].rotulo : SEM_DATA),
    },
    {
      id: "publicacao",
      cabecalho: "Publicada em",
      celula: ({ data_publicacao }) => (data_publicacao ? formatarData(data_publicacao) : SEM_DATA),
    },
    {
      id: "encerramento",
      cabecalho: "Encerra em",
      celula: ({ data_encerramento }) =>
        data_encerramento ? formatarDataCivil(data_encerramento) : SEM_DATA,
    },
    {
      id: "status",
      cabecalho: "Status",
      celula: ({ situacao }) => (
        <SeloStatus tom={rotulosSituacaoOportunidade[situacao].tom}>
          {rotulosSituacaoOportunidade[situacao].rotulo}
        </SeloStatus>
      ),
    },
    {
      id: "acoes",
      cabecalho: "Ações",
      celula: (vaga) => (
        <span className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1 lg:justify-start">
          {acoesDaLinha(vaga.situacao).map((acao, indice) => (
            <Fragment key={acao}>
              {indice > 0 && (
                <span aria-hidden="true" className="text-texto-secundario">
                  ·
                </span>
              )}
              {renderizarAcao(acao, vaga)}
            </Fragment>
          ))}
        </span>
      ),
    },
  ];
}

export function TabelaVagasAdmin({ vagas, carregando, vazio, ...acoes }: PropsTabelaVagasAdmin) {
  return (
    <Tabela
      rotulo="Vagas cadastradas"
      colunas={colunas(acoes)}
      itens={vagas}
      chave={(vaga) => vaga.id_oportunidade}
      carregando={carregando}
      vazio={vazio}
    />
  );
}
