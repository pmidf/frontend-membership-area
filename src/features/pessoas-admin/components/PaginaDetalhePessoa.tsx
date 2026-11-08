"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { CartaoSituacaoFiliacao } from "@/features/perfil/components/CartaoSituacaoFiliacao";
import { EstadoErro, EstadoVazio, Esqueleto } from "@/shared/ui";
import { classesBotao } from "@/shared/ui/botao/Botao";

import { pessoaNaoEncontrada, usePessoa } from "../api/pessoas-admin.queries";
import { CabecalhoPessoaAdmin } from "./CabecalhoPessoaAdmin";
import { DadosPessoaisLeitura } from "./DadosPessoaisLeitura";
import { SessoesPessoa } from "./SessoesPessoa";
import { SituacaoConta } from "./SituacaoConta";

function Secao({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  const idTitulo = `titulo-${id}`;
  return (
    <section aria-labelledby={idTitulo} className="flex flex-col gap-4">
      <h2 id={idTitulo} className="text-h3">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function ConteudoDetalhe({ id, destinoVolta }: { id: string; destinoVolta: string }) {
  const pessoa = usePessoa(id);

  if (pessoa.isPending) {
    return <Esqueleto variante="cartao" quantidade={2} rotulo="Carregando a pessoa…" />;
  }
  if (pessoaNaoEncontrada(pessoa.error)) {
    return (
      <EstadoVazio
        titulo="Pessoa não encontrada"
        acao={
          <Link
            href={destinoVolta}
            className={classesBotao({ variante: "secundario", tamanho: "sm" })}
          >
            Voltar para Pessoas
          </Link>
        }
      />
    );
  }
  if (pessoa.isError) {
    return (
      <EstadoErro
        mensagem="Não foi possível carregar os dados da pessoa."
        aoTentarNovamente={() => void pessoa.refetch()}
      />
    );
  }

  const dados = pessoa.data;

  return (
    <>
      <CabecalhoPessoaAdmin pessoa={dados} />
      <Secao id="dados-pessoais" titulo="Dados pessoais">
        <DadosPessoaisLeitura pessoa={dados} />
      </Secao>
      <Secao id="filiacao" titulo="Filiação PMI">
        <CartaoSituacaoFiliacao
          filiacao={dados.filiacao}
          filiado={dados.papeis.filiado}
          visao="admin"
        />
      </Secao>
      <Secao id="sessoes" titulo="Sessões ativas">
        <SessoesPessoa sessoes={dados.sessoes_ativas} />
      </Secao>
      <Secao id="situacao-conta" titulo="Situação da conta">
        <SituacaoConta pessoa={dados} />
      </Secao>
    </>
  );
}

export function PaginaDetalhePessoa() {
  const { id } = useParams<{ id: string }>();
  const consulta = useSearchParams().toString();
  const destinoVolta = consulta ? `/admin/pessoas?${consulta}` : "/admin/pessoas";

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Link
        href={destinoVolta}
        className="inline-flex items-center gap-1 self-start text-corpo-pequeno font-medium text-texto-marca underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-acao-destaque"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        Voltar para Pessoas
      </Link>
      <ConteudoDetalhe id={id} destinoVolta={destinoVolta} />
    </div>
  );
}
