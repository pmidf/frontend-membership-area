"use client";

import { Trophy } from "lucide-react";

import { CabecalhoPagina, Cartao, EstadoErro, EstadoVazio, LinkVoltar } from "@/shared/ui";

import { useNomesDoRanking, useRanking } from "../api/ranking.queries";
import { TabelaRanking } from "./TabelaRanking";

export function PaginaRankingGamificacao() {
  const ranking = useRanking();
  const linhas = ranking.data ?? [];
  const nomes = useNomesDoRanking(linhas.map(({ pessoa_id }) => pessoa_id));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <LinkVoltar href="/admin/quebra-cabecas">Voltar para quebra-cabeças</LinkVoltar>
      <CabecalhoPagina
        titulo="Estatísticas de gamificação"
        subtitulo="Top 10 filiados com mais quebra-cabeças completos."
      />
      <Cartao className="p-0 md:p-2">
        {ranking.isError && !ranking.data ? (
          <EstadoErro
            compacto
            mensagem="Não foi possível carregar o ranking."
            aoTentarNovamente={() => void ranking.refetch()}
          />
        ) : (
          <TabelaRanking
            linhas={linhas}
            nomes={nomes}
            carregando={ranking.isPending}
            vazio={<EstadoVazio icone={Trophy} titulo="Ninguém concluiu um quebra-cabeça ainda." />}
          />
        )}
      </Cartao>
    </div>
  );
}
