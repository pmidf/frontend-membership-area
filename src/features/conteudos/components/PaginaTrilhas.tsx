"use client";

import { CabecalhoPagina, EstadoErro, EstadoVazio, Esqueleto } from "@/shared/ui";

import { useTrilhas } from "../api/conteudos.queries";
import { GradeTrilhas } from "./CartaoTrilha";
import { LinkVoltarCatalogo } from "./LinkVoltarCatalogo";

export function PaginaTrilhas() {
  const trilhas = useTrilhas();

  function corpo() {
    if (trilhas.isPending) {
      return <Esqueleto variante="cartao" quantidade={3} rotulo="Carregando as trilhas…" />;
    }
    if (trilhas.isError) {
      return (
        <EstadoErro
          mensagem="Não foi possível carregar as trilhas."
          aoTentarNovamente={() => void trilhas.refetch()}
        />
      );
    }
    if (trilhas.data.length === 0) {
      return (
        <EstadoVazio
          titulo="Nenhuma trilha publicada ainda"
          descricao="Enquanto isso, explore a biblioteca de conteúdos."
        />
      );
    }
    return <GradeTrilhas trilhas={trilhas.data} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <LinkVoltarCatalogo />
      <CabecalhoPagina
        titulo="Trilhas"
        subtitulo="Sequências de vídeos e materiais para estudar na ordem certa."
      />
      {corpo()}
    </div>
  );
}
