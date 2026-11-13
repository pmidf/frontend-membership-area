"use client";

import { Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Botao } from "@/shared/ui";

import { filiacaoNecessaria, usePlayer } from "../api/conteudos.queries";
import { CAMINHO_CATALOGO } from "../lib/origem-catalogo";
import type { ConteudoAcessivel } from "../tipos/conteudo";
import { EmbedYoutube } from "./EmbedYoutube";

export function PlayerVideo({ conteudo }: { conteudo: ConteudoAcessivel }) {
  const { id_conteudo, titulo, bol_exclusivo } = conteudo;
  const roteador = useRouter();
  const player = usePlayer(id_conteudo, !bol_exclusivo);
  const semFiliacao = filiacaoNecessaria(player.error);

  useEffect(() => {
    if (semFiliacao) roteador.replace(CAMINHO_CATALOGO);
  }, [semFiliacao, roteador]);

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-linear-148 from-violeta-950 to-violeta-500 to-70%">
      {player.data ? (
        <EmbedYoutube src={player.data.embed_url} titulo={titulo} className="size-full" />
      ) : (
        <div className="flex size-full flex-col items-center justify-center gap-3.5 p-4 text-center">
          {player.isError && !semFiliacao ? (
            <>
              <p className="text-corpo-pequeno text-violeta-50">
                Não foi possível carregar o vídeo.
              </p>
              <Botao variante="inverso" tamanho="sm" onClick={() => void player.refetch()}>
                Tentar novamente
              </Botao>
            </>
          ) : (
            <>
              <span className="flex size-19 items-center justify-center rounded-pill bg-branco">
                <Play aria-hidden="true" className="size-6.5 fill-current text-texto-marca" />
              </span>
              <p role="status" className="text-legenda text-violeta-50">
                {bol_exclusivo ? "Reprodução liberada para filiados ativos" : "Carregando o vídeo…"}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
