"use client";

import { Check, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import { BotaoQueroSerFiliado } from "@/features/conversao/components/BotaoQueroSerFiliado";
import { Cartao, cn, Etiqueta, EstadoErro, EstadoVazio, Esqueleto } from "@/shared/ui";
import { classesBotao } from "@/shared/ui/botao/Botao";

import { conteudoNaoEncontrado, useTrilha } from "../api/conteudos.queries";
import { legendaCurtaConteudo } from "../lib/legenda-conteudo";
import { caminhoDoConteudo, destinoDeVolta } from "../lib/origem-catalogo";
import { proximoDaTrilha } from "../lib/progresso-trilha";
import { useOrigemAtual } from "../lib/useOrigemAtual";
import type { ItemCatalogo } from "../tipos/conteudo";
import type { DetalheTrilha } from "../tipos/trilha";
import { BarraProgressoTrilha } from "./BarraProgressoTrilha";
import { LinkVoltarCatalogo } from "./LinkVoltarCatalogo";
import { MiniaturaConteudo } from "./MiniaturaConteudo";

type PropsItem = { item: ItemCatalogo; posicao: number; ehProximo: boolean; origem: string };

function MarcadorPosicao({ posicao, visto }: { posicao: number; visto: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-pill text-legenda font-bold",
        visto ? "bg-acao-primaria text-texto-inverso" : "bg-violeta-50 text-texto-marca",
      )}
    >
      {visto ? <Check className="size-3.5" /> : posicao}
    </span>
  );
}

function ItemDaTrilha({ item, posicao, ehProximo, origem }: PropsItem) {
  const visto = !item.bloqueado && item.consumido;
  const texto = (
    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="text-corpo-pequeno font-medium break-words text-texto-primario">
        {item.titulo}
      </span>
      {!item.bloqueado && (
        <span className="text-legenda text-texto-secundario">{legendaCurtaConteudo(item)}</span>
      )}
    </span>
  );
  const classes = "flex items-center gap-3 rounded-md bg-neutro-100 px-3 py-2.5";

  if (item.bloqueado) {
    return (
      <div className={classes}>
        <MarcadorPosicao posicao={posicao} visto={false} />
        <MiniaturaConteudo tipo={item.tipo} borrada className="max-sm:hidden" />
        {texto}
        <Etiqueta tom="aqua">Exclusivo para filiados</Etiqueta>
      </div>
    );
  }
  return (
    <Link
      href={caminhoDoConteudo(item.id_conteudo, origem)}
      className={cn(
        classes,
        "hover:bg-violeta-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acao-destaque",
        ehProximo && "outline-[1.5px] outline-acao-primaria",
      )}
    >
      <MarcadorPosicao posicao={posicao} visto={visto} />
      <MiniaturaConteudo tipo={item.tipo} className="max-sm:hidden" />
      {texto}
      {visto ? (
        <Etiqueta tom="sucesso">Visto</Etiqueta>
      ) : (
        <span className="inline-flex shrink-0 items-center text-rotulo text-texto-marca">
          {ehProximo ? "Próximo" : "Abrir"}
          <ChevronRight aria-hidden="true" className="size-4" />
        </span>
      )}
    </Link>
  );
}

function CartaoProgresso({ trilha, origem }: { trilha: DetalheTrilha; origem: string }) {
  const { titulo, itens, itens_vistos, total_itens } = trilha;
  const proximo = proximoDaTrilha(itens);
  const exclusivos = itens.filter(({ bloqueado }) => bloqueado).length;

  return (
    <Cartao className="flex flex-col gap-3 p-5.5">
      <h2 className="text-h3">Seu progresso</h2>
      <p className="text-h2 font-bold text-texto-marca">
        {itens_vistos} de {total_itens}
      </p>
      <BarraProgressoTrilha titulo={titulo} vistos={itens_vistos} total={total_itens} />
      <p className="text-corpo-pequeno text-texto-secundario">conteúdos concluídos</p>
      {total_itens > 0 && itens_vistos >= total_itens && (
        <p className="text-corpo-pequeno font-medium">Você concluiu esta trilha.</p>
      )}
      {proximo && (
        <>
          <p className="text-legenda font-medium text-texto-secundario">Próximo</p>
          <p className="font-medium break-words">{proximo.titulo}</p>
          <Link
            href={caminhoDoConteudo(proximo.id_conteudo, origem)}
            className={classesBotao({ larguraTotal: true })}
          >
            {itens_vistos === 0 ? "Começar trilha" : "Continuar trilha"}
          </Link>
        </>
      )}
      {exclusivos > 0 && (
        <>
          <p className="text-corpo-pequeno text-texto-secundario">
            {exclusivos === 1
              ? "1 conteúdo desta trilha é exclusivo para filiados."
              : `${exclusivos} conteúdos desta trilha são exclusivos para filiados.`}
          </p>
          <BotaoQueroSerFiliado
            origem="CONTEUDO"
            rotulo="Quero me filiar"
            variante={proximo ? "secundario" : "primario"}
            larguraTotal
          />
        </>
      )}
    </Cartao>
  );
}

function DetalheDaTrilha({ trilha, origem }: { trilha: DetalheTrilha; origem: string }) {
  const { titulo, descricao, itens, total_itens } = trilha;
  const proximo = proximoDaTrilha(itens);

  return (
    <>
      <header className="flex flex-col gap-1.5">
        <p className="text-rotulo text-texto-marca">
          Trilha · {total_itens === 1 ? "1 item" : `${total_itens} itens`}
        </p>
        <h1 className="text-h2 break-words md:text-display">{titulo}</h1>
        <p className="text-corpo text-texto-secundario">{descricao}</p>
      </header>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_21.25rem]">
        <Cartao className="flex min-w-0 flex-col gap-4 p-5.5">
          <h2 className="text-h3">Conteúdos da trilha</h2>
          <ol aria-label="Conteúdos na ordem da trilha" className="flex flex-col gap-2">
            {itens.map((item, indice) => (
              <li key={item.id_conteudo}>
                <ItemDaTrilha
                  item={item}
                  posicao={indice + 1}
                  ehProximo={item.id_conteudo === proximo?.id_conteudo}
                  origem={origem}
                />
              </li>
            ))}
          </ol>
        </Cartao>
        <CartaoProgresso trilha={trilha} origem={origem} />
      </div>
    </>
  );
}

export function PaginaTrilha() {
  const { id } = useParams<{ id: string }>();
  const destinoVolta = destinoDeVolta(useSearchParams().get("de"));
  const origem = useOrigemAtual();
  const consulta = useTrilha(id);

  function corpo() {
    if (consulta.isPending) {
      return <Esqueleto variante="cartao" quantidade={2} rotulo="Carregando a trilha…" />;
    }
    if (conteudoNaoEncontrado(consulta.error)) {
      return (
        <EstadoVazio
          titulo="Trilha não encontrada"
          descricao="Ela pode ter sido arquivada ou o endereço está incorreto."
        />
      );
    }
    if (consulta.isError) {
      return (
        <EstadoErro
          mensagem="Não foi possível carregar a trilha."
          aoTentarNovamente={() => void consulta.refetch()}
        />
      );
    }
    return <DetalheDaTrilha trilha={consulta.data} origem={origem} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <LinkVoltarCatalogo href={destinoVolta} />
      {corpo()}
    </div>
  );
}
