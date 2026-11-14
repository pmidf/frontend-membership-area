import { Lock } from "lucide-react";

import { BloqueioSecao } from "@/features/conversao/components/BloqueioSecao";
import { BotaoQueroSerFiliado } from "@/features/conversao/components/BotaoQueroSerFiliado";
import { Cartao } from "@/shared/ui";

import { TOTAL_PECAS } from "../tipos/gamificacao";
import { CartaoSurpresa } from "./CartaoSurpresa";
import { TabuleiroVazio } from "./TabuleiroVazio";

const CARTOES_SURPRESA = 6;
const CARTOES_SURPRESA_MOBILE = 3;

function FaixaConversao() {
  return (
    <>
      <section
        aria-label="Você ainda não tem nenhuma peça"
        className="hidden items-center justify-between gap-6 rounded-lg bg-linear-to-r from-violeta-500 to-aqua-600 px-8 py-6 text-texto-inverso md:flex"
      >
        <div className="flex max-w-xl flex-col gap-1">
          <h2 className="text-lg font-bold">Você ainda não tem nenhuma peça</h2>
          <p className="text-corpo-pequeno text-violeta-50">
            Filiados ganham 1 crédito a cada presença confirmada em um evento do capítulo — e trocam
            por peças no dado.
          </p>
        </div>
        <BotaoQueroSerFiliado rotulo="Quero me filiar" variante="inverso" className="shrink-0" />
      </section>
      <section aria-label="Exclusivo para filiados" className="flex flex-col gap-5 md:hidden">
        <div className="flex flex-col gap-1 rounded-lg bg-linear-to-r from-aqua-600 to-acao-destaque p-4 text-texto-inverso">
          <h2 className="flex items-center gap-1.5 text-corpo font-bold">
            <Lock aria-hidden="true" className="size-4" />
            Exclusivo para filiados
          </h2>
          <p className="text-corpo-pequeno">
            Filie-se para começar a colecionar peças a cada evento.
          </p>
        </div>
        <BotaoQueroSerFiliado larguraTotal />
      </section>
    </>
  );
}

function IndicadorBloqueado({ rotulo }: { rotulo: string }) {
  return (
    <Cartao className="flex flex-col items-start gap-2.5 p-5">
      <p className="text-corpo-pequeno text-texto-secundario">{rotulo}</p>
      <span
        aria-hidden="true"
        className="rounded-pill bg-texto-marca px-3.5 py-1.5 text-h3 text-texto-inverso blur-[5px] select-none"
      >
        ••
      </span>
      <p className="flex items-center gap-1.5 text-legenda text-texto-secundario">
        <Lock aria-hidden="true" className="size-3" />
        Disponível para filiados
      </p>
    </Cartao>
  );
}

function QuebraCabecaAtualBloqueado() {
  return (
    <section aria-labelledby="titulo-atual-bloqueado" className="hidden flex-col gap-7 md:flex">
      <header className="flex flex-col gap-1">
        <h2 id="titulo-atual-bloqueado" className="text-h3">
          Quebra-cabeça atual
        </h2>
        <p className="text-corpo-pequeno text-texto-secundario">
          Assim que você se filiar, cada presença confirmada em evento vira 1 crédito, trocável por
          uma peça no dado.
        </p>
      </header>
      <BloqueioSecao
        titulo="Filie-se para começar a colecionar peças"
        descricao="Cada presença confirmada em um evento vira 1 crédito — troque por uma peça no dado do seu quebra-cabeça."
      >
        <Cartao className="flex flex-col items-center gap-5 px-6 py-10 text-center">
          <TabuleiroVazio className="max-w-108" />
          <p className="text-h3">Nenhum quebra-cabeça em andamento</p>
          <p className="text-corpo font-medium text-texto-marca">
            0 de {TOTAL_PECAS} peças coletadas
          </p>
          <span className="h-2 w-full max-w-90 rounded-pill bg-neutro-200" />
          <p className="text-corpo-pequeno text-texto-secundario">
            Filie-se e participe de um evento para ganhar sua primeira peça.
          </p>
        </Cartao>
      </BloqueioSecao>
    </section>
  );
}

function CatalogoBloqueado() {
  return (
    <section aria-labelledby="titulo-catalogo-bloqueado" className="flex flex-col gap-4 md:gap-7">
      <header className="flex flex-col gap-1">
        <h2 id="titulo-catalogo-bloqueado" className="text-corpo font-bold md:text-h3">
          Catálogo de quebra-cabeças
        </h2>
        <p className="hidden text-corpo-pequeno text-texto-secundario md:block">
          Cada evento do capítulo pode virar um quebra-cabeça colecionável. Filie-se para começar a
          descobrir.
        </p>
      </header>
      <ul className="grid gap-3 md:grid-cols-3 md:gap-5">
        {Array.from({ length: CARTOES_SURPRESA }, (_, indice) => (
          <li key={indice} className={indice >= CARTOES_SURPRESA_MOBILE ? "hidden md:block" : ""}>
            <CartaoSurpresa />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ConquistasBloqueadas() {
  return (
    <>
      <FaixaConversao />
      <section
        aria-label="Resumo da coleção"
        className="hidden grid-cols-2 gap-5 md:grid lg:grid-cols-3"
      >
        <IndicadorBloqueado rotulo="Quebra-cabeças completos" />
        <IndicadorBloqueado rotulo="Peças coletadas no atual" />
      </section>
      <QuebraCabecaAtualBloqueado />
      <CatalogoBloqueado />
      <p className="hidden rounded-md bg-violeta-50 px-5 py-4 text-corpo-pequeno text-texto-secundario md:block">
        Cada quebra-cabeça tem sempre {TOTAL_PECAS} peças. Ao se filiar, você sorteia seu primeiro
        quebra-cabeça no dado, e cada presença confirmada em um evento vira 1 crédito para destravar
        peças.
      </p>
    </>
  );
}
