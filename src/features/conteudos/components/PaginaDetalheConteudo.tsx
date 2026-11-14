"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { EstadoErro, EstadoVazio, Esqueleto } from "@/shared/ui";

import { conteudoNaoEncontrado, useConteudo } from "../api/conteudos.queries";
import { CAMINHO_CATALOGO, destinoDeVolta } from "../lib/origem-catalogo";
import type { ConteudoAcessivel } from "../tipos/conteudo";
import { BotaoMarcarVisto } from "./BotaoMarcarVisto";
import { CartaoMaterial } from "./CartaoMaterial";
import { CartaoSobreAcesso } from "./CartaoSobreAcesso";
import { InfoConteudo } from "./InfoConteudo";
import { LinkVoltarCatalogo } from "./LinkVoltarCatalogo";
import { PlayerVideo } from "./PlayerVideo";

function DetalheConteudo({ conteudo }: { conteudo: ConteudoAcessivel }) {
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_21.25rem]">
      <div className="flex min-w-0 flex-col gap-5">
        {conteudo.tipo === "VIDEO" ? (
          <PlayerVideo conteudo={conteudo} />
        ) : (
          <CartaoMaterial conteudo={conteudo} />
        )}
        <InfoConteudo conteudo={conteudo} />
        <BotaoMarcarVisto conteudo={conteudo} />
      </div>
      <CartaoSobreAcesso exclusivo={conteudo.bol_exclusivo} />
    </div>
  );
}

export function PaginaDetalheConteudo() {
  const { id } = useParams<{ id: string }>();
  const roteador = useRouter();
  const destinoVolta = destinoDeVolta(useSearchParams().get("de"));
  const consulta = useConteudo(id);
  const conteudo = consulta.data;
  const bloqueado = conteudo?.bloqueado === true;

  useEffect(() => {
    if (bloqueado) roteador.replace(CAMINHO_CATALOGO);
  }, [bloqueado, roteador]);

  function corpo() {
    if (consulta.isPending || bloqueado) {
      return <Esqueleto variante="cartao" rotulo="Carregando o conteúdo…" />;
    }
    if (conteudoNaoEncontrado(consulta.error)) {
      return (
        <EstadoVazio
          titulo="Conteúdo não encontrado"
          descricao="Ele pode ter sido arquivado ou o endereço está incorreto."
        />
      );
    }
    if (!conteudo || conteudo.bloqueado) {
      return (
        <EstadoErro
          mensagem="Não foi possível carregar o conteúdo."
          aoTentarNovamente={() => void consulta.refetch()}
        />
      );
    }
    return <DetalheConteudo conteudo={conteudo} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <LinkVoltarCatalogo href={destinoVolta} />
      {corpo()}
    </div>
  );
}
