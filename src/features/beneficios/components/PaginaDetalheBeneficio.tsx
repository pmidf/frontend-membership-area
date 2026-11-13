"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { formatarDataCivil } from "@/shared/lib/datas";
import { Cartao, Esqueleto, EstadoErro, EstadoVazio, Etiqueta, LinkVoltar } from "@/shared/ui";
import { classesBotao } from "@/shared/ui/botao/Botao";

import {
  beneficioNaoEncontrado,
  filiacaoNecessaria,
  useBeneficio,
} from "../api/beneficios.queries";
import { rotulosCategoria } from "../lib/rotulos-beneficio";
import type { DetalheBeneficio } from "../tipos/beneficio";
import { BotaoResgatar } from "./BotaoResgatar";
import { CartaoResgate } from "./CartaoResgate";
import { ImagemBeneficio } from "./ImagemBeneficio";

function textoVigencia({ vigencia_inicio, vigencia_fim }: DetalheBeneficio): string {
  const inicio = formatarDataCivil(vigencia_inicio);
  return vigencia_fim
    ? `vigente de ${inicio} a ${formatarDataCivil(vigencia_fim)}`
    : `vigente desde ${inicio}`;
}

function ConteudoDetalhe({ beneficio }: { beneficio: DetalheBeneficio }) {
  const { rotulo, tom } = rotulosCategoria[beneficio.categoria];

  return (
    <div className="grid gap-y-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-x-6 lg:gap-y-0">
      <Cartao className="flex flex-col gap-4 p-6 lg:rounded-b-none lg:border-b-0 lg:pb-3">
        <ImagemBeneficio src={beneficio.imagem} alt="" className="h-40 md:h-56" />
        <div className="flex flex-wrap gap-2">
          <Etiqueta tom={tom}>{rotulo}</Etiqueta>
          <Etiqueta tom="violeta">Exclusivo para filiados</Etiqueta>
        </div>
        <h1 className="text-h2 md:text-display">{beneficio.titulo}</h1>
        <p className="text-corpo-pequeno text-texto-secundario">
          Parceiro: {beneficio.parceiro} · {textoVigencia(beneficio)}
        </p>
      </Cartao>
      <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <CartaoResgate beneficio={beneficio}>
          <BotaoResgatar beneficio={beneficio} />
        </CartaoResgate>
      </div>
      <Cartao className="p-6 lg:col-start-1 lg:rounded-t-none lg:border-t-0 lg:pt-3">
        <p className="break-words whitespace-pre-line">{beneficio.descricao}</p>
      </Cartao>
    </div>
  );
}

export function PaginaDetalheBeneficio() {
  const { id } = useParams<{ id: string }>();
  const roteador = useRouter();
  const consulta = useSearchParams().toString();
  const beneficio = useBeneficio(id);
  const semFiliacao = filiacaoNecessaria(beneficio.error);
  const destinoVolta = consulta ? `/beneficios?${consulta}` : "/beneficios";

  useEffect(() => {
    if (semFiliacao) roteador.replace("/beneficios");
  }, [semFiliacao, roteador]);

  function conteudo() {
    if (beneficio.isPending || semFiliacao) {
      return <Esqueleto variante="cartao" rotulo="Carregando o benefício…" />;
    }
    if (beneficioNaoEncontrado(beneficio.error)) {
      return (
        <EstadoVazio
          titulo="Este benefício não está mais disponível"
          acao={
            <Link
              href={destinoVolta}
              className={classesBotao({ variante: "secundario", tamanho: "sm" })}
            >
              Ir para o clube de benefícios
            </Link>
          }
        />
      );
    }
    if (beneficio.isError) {
      return (
        <EstadoErro
          mensagem="Não foi possível carregar o benefício."
          aoTentarNovamente={() => void beneficio.refetch()}
        />
      );
    }
    return <ConteudoDetalhe beneficio={beneficio.data} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <LinkVoltar href={destinoVolta}>Voltar para o clube de benefícios</LinkVoltar>
      {conteudo()}
    </div>
  );
}
