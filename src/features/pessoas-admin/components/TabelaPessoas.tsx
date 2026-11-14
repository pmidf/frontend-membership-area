"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { diasDesde, formatarData } from "@/shared/lib/datas";
import { SeloStatus, Tabela, type ColunaTabela } from "@/shared/ui";

import type { PessoaResumo } from "../api/pessoas-admin.api";
import { rotuloFiliacao, rotulosSituacaoConta } from "../lib/rotulos";

type PropsTabelaPessoas = {
  pessoas: PessoaResumo[];
  carregando: boolean;
  vazio: ReactNode;
  consultaAtual: string;
};

const classesLink =
  "text-corpo-pequeno font-medium whitespace-nowrap text-texto-marca underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-acao-destaque";

function colunasPessoas(consultaAtual: string): ColunaTabela<PessoaResumo>[] {
  const sufixo = consultaAtual ? `?${consultaAtual}` : "";

  return [
    {
      id: "nome",
      cabecalho: "Nome",
      celula: ({ nome_completo, bol_admin }) => (
        <span className="inline-flex flex-wrap items-center justify-end gap-2 md:justify-start">
          <span className="font-medium">{nome_completo}</span>
          {bol_admin && <SeloStatus tom="violeta">Admin</SeloStatus>}
        </span>
      ),
    },
    {
      id: "email",
      cabecalho: "E-mail",
      celula: ({ email }) => <span className="break-all">{email ?? "—"}</span>,
    },
    {
      id: "filiacao",
      cabecalho: "Filiação",
      celula: ({ filiacao }) => {
        const { rotulo, tom } = rotuloFiliacao(filiacao);
        return <SeloStatus tom={tom}>{rotulo}</SeloStatus>;
      },
    },
    {
      id: "situacao",
      cabecalho: "Situação da conta",
      celula: ({ situacao_conta }) => {
        const { rotulo, tom } = rotulosSituacaoConta[situacao_conta];
        return <SeloStatus tom={tom}>{rotulo}</SeloStatus>;
      },
    },
    {
      id: "cadastro",
      cabecalho: "Cadastro",
      ocultarNoCartao: true,
      celula: ({ data_cadastro }) => formatarData(data_cadastro),
    },
    {
      id: "ultimo-acesso",
      cabecalho: "Último acesso",
      ocultarNoCartao: true,
      celula: ({ data_ultimo_acesso }) =>
        data_ultimo_acesso ? diasDesde(data_ultimo_acesso) : "—",
    },
    {
      id: "acao",
      cabecalho: <span className="sr-only">Ações</span>,
      celula: ({ id_pessoa, nome_completo }) => (
        <Link
          href={`/admin/pessoas/${id_pessoa}${sufixo}`}
          aria-label={`Ver perfil de ${nome_completo}`}
          className={classesLink}
        >
          Ver perfil
        </Link>
      ),
    },
  ];
}

export function TabelaPessoas({ pessoas, carregando, vazio, consultaAtual }: PropsTabelaPessoas) {
  return (
    <Tabela
      rotulo="Pessoas cadastradas"
      colunas={colunasPessoas(consultaAtual)}
      itens={pessoas}
      chave={(pessoa) => pessoa.id_pessoa}
      carregando={carregando}
      vazio={vazio}
    />
  );
}
