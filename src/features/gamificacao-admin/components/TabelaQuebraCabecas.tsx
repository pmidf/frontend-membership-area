"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { SeloStatus, Tabela, type ColunaTabela } from "@/shared/ui";
import { classesBotao } from "@/shared/ui/botao/Botao";

import { acoesPorSituacao, rotulosSituacaoQuebraCabeca } from "../lib/acoes-por-situacao";
import type { ItemQuebraCabecaAdmin } from "../tipos/quebra-cabeca-admin";

type PropsTabelaQuebraCabecas = {
  quebraCabecas: ItemQuebraCabecaAdmin[];
  carregando: boolean;
  vazio: ReactNode;
  publicando: string | null;
  aoPublicar: (item: ItemQuebraCabecaAdmin) => void;
};

function colunas({
  publicando,
  aoPublicar,
}: Pick<
  PropsTabelaQuebraCabecas,
  "publicando" | "aoPublicar"
>): ColunaTabela<ItemQuebraCabecaAdmin>[] {
  return [
    {
      id: "nome",
      cabecalho: "Nome",
      celula: ({ nome }) => <span className="font-medium">{nome}</span>,
    },
    {
      id: "status",
      cabecalho: "Status",
      celula: ({ situacao }) => (
        <SeloStatus tom={rotulosSituacaoQuebraCabeca[situacao].tom}>
          {rotulosSituacaoQuebraCabeca[situacao].rotulo}
        </SeloStatus>
      ),
    },
    { id: "pecas", cabecalho: "Peças", celula: ({ total_pecas }) => total_pecas },
    { id: "concluiram", cabecalho: "Concluíram", celula: ({ concluidos }) => concluidos },
    { id: "montando", cabecalho: "Montando", celula: ({ em_andamento }) => em_andamento },
    {
      id: "acoes",
      cabecalho: "Ações",
      celula: (item) => (
        <span className="flex flex-wrap gap-2">
          {acoesPorSituacao(item.situacao).map((acao) =>
            acao === "editar" ? (
              <Link
                key={acao}
                href={`/admin/quebra-cabecas/${item.id_quebra_cabeca}`}
                aria-label={`Editar ${item.nome}`}
                className={classesBotao({ variante: "secundario", tamanho: "sm" })}
              >
                ✎ Editar
              </Link>
            ) : (
              <button
                key={acao}
                type="button"
                aria-label={`Publicar ${item.nome}`}
                aria-busy={publicando === item.id_quebra_cabeca || undefined}
                disabled={publicando !== null}
                onClick={() => aoPublicar(item)}
                className={classesBotao({ tamanho: "sm" })}
              >
                Publicar
              </button>
            ),
          )}
        </span>
      ),
    },
  ];
}

export function TabelaQuebraCabecas({
  quebraCabecas,
  carregando,
  vazio,
  publicando,
  aoPublicar,
}: PropsTabelaQuebraCabecas) {
  return (
    <Tabela
      rotulo="Quebra-cabeças cadastrados"
      colunas={colunas({ publicando, aoPublicar })}
      itens={quebraCabecas}
      chave={(item) => item.id_quebra_cabeca}
      carregando={carregando}
      vazio={vazio}
    />
  );
}
