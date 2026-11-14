"use client";

import { PainelExclusivoFiliados } from "@/features/conversao/components/PainelExclusivoFiliados";
import { useSessao } from "@/shared/sessao/useSessao";
import { CabecalhoPagina, EstadoErro, Esqueleto } from "@/shared/ui";

import { filiacaoNecessaria, usePainelGamificacao } from "../api/gamificacao.queries";
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

function Bloqueado() {
  return (
    <PainelExclusivoFiliados
      titulo="Você ainda não tem nenhuma peça"
      descricao="Filiados ganham 1 crédito a cada presença confirmada em um evento do capítulo — e trocam por peças no dado."
      rotuloCta="Quero me filiar"
      mostrarJaSouFiliado={false}
    />
  );
}

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
            Cada presença confirmada em evento vira 1 crédito. Use o dado para trocar um crédito por
            uma peça — e sorteie um novo quebra-cabeça assim que completar o atual.
          </span>
        }
      />
      {bloqueado ? (
        <Bloqueado />
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
