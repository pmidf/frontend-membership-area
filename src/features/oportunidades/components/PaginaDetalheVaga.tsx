"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { EstadoErro, EstadoVazio, Esqueleto, LinkVoltar } from "@/shared/ui";
import { classesBotao } from "@/shared/ui/botao/Botao";

import {
  filiacaoNecessaria,
  oportunidadeEncerrada,
  oportunidadeNaoEncontrada,
  useOportunidade,
} from "../api/oportunidades.queries";
import { CartaoCandidatura } from "./CartaoCandidatura";
import { DetalheVaga } from "./DetalheVaga";

const CAMINHO_VAGAS = "/vagas";

export function PaginaDetalheVaga() {
  const { id } = useParams<{ id: string }>();
  const roteador = useRouter();
  const consulta = useSearchParams().toString();
  const vaga = useOportunidade(id);
  const semFiliacao = filiacaoNecessaria(vaga.error);
  const destinoVolta = consulta ? `${CAMINHO_VAGAS}?${consulta}` : CAMINHO_VAGAS;

  useEffect(() => {
    if (semFiliacao) roteador.replace(CAMINHO_VAGAS);
  }, [semFiliacao, roteador]);

  const linkParaVagas = (
    <Link href={destinoVolta} className={classesBotao({ variante: "secundario", tamanho: "sm" })}>
      Ver as vagas abertas
    </Link>
  );

  function conteudo() {
    if (vaga.isPending || semFiliacao) {
      return <Esqueleto variante="cartao" quantidade={2} rotulo="Carregando a vaga…" />;
    }
    if (oportunidadeEncerrada(vaga.error)) {
      return (
        <EstadoVazio
          titulo="Esta vaga foi encerrada"
          descricao="Ela não recebe mais candidaturas."
          acao={linkParaVagas}
        />
      );
    }
    if (oportunidadeNaoEncontrada(vaga.error)) {
      return <EstadoVazio titulo="Vaga não encontrada" acao={linkParaVagas} />;
    }
    if (vaga.isError) {
      return (
        <EstadoErro
          mensagem="Não foi possível carregar a vaga."
          aoTentarNovamente={() => void vaga.refetch()}
        />
      );
    }
    return <DetalheVaga oportunidade={vaga.data} lateral={<CartaoCandidatura id={id} />} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <LinkVoltar href={destinoVolta}>Voltar para as vagas</LinkVoltar>
      {conteudo()}
    </div>
  );
}
