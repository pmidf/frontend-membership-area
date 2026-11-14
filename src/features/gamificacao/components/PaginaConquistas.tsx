"use client";

import { useSessao } from "@/shared/sessao/useSessao";
import { CabecalhoPagina, EstadoErro, Esqueleto } from "@/shared/ui";

import { filiacaoNecessaria, usePainelGamificacao } from "../api/gamificacao.queries";
import { ConquistasBloqueadas } from "./ConquistasBloqueadas";
import { PainelQuebraCabecas } from "./PainelQuebraCabecas";

function Carregando() {
  return (
    <div className="flex flex-col gap-7">
      <Esqueleto
        variante="bloco"
        quantidade={3}
        rotulo="Carregando os indicadores…"
        className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-5"
      />
      <Esqueleto variante="cartao" rotulo="Carregando o tabuleiro…" />
    </div>
  );
}

const SUBTITULO_FILIADO =
  "Cada presença confirmada em evento vira 1 crédito. Use o dado para trocar um crédito por uma peça — e sorteie um novo quebra-cabeça assim que completar o atual.";
const SUBTITULO_BLOQUEADO =
  "Filie-se ao PMI-DF para começar a ganhar créditos e colecionar peças a cada presença confirmada em evento.";

export function PaginaConquistas() {
  const { estado, ehFiliado } = useSessao();
  const painel = usePainelGamificacao();
  const bloqueado = (estado === "autenticado" && !ehFiliado) || filiacaoNecessaria(painel.error);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 md:gap-7">
      <CabecalhoPagina
        titulo="Seus quebra-cabeças"
        subtitulo={
          <span className="hidden md:inline">
            {bloqueado ? SUBTITULO_BLOQUEADO : SUBTITULO_FILIADO}
          </span>
        }
      />
      {bloqueado ? (
        <ConquistasBloqueadas />
      ) : painel.data ? (
        <PainelQuebraCabecas painel={painel.data} />
      ) : painel.isError ? (
        <EstadoErro
          mensagem="Não foi possível carregar seus quebra-cabeças."
          aoTentarNovamente={() => void painel.refetch()}
        />
      ) : (
        <Carregando />
      )}
    </div>
  );
}
