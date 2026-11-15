"use client";

import Link from "next/link";

import { Cartao } from "@/shared/ui";

import { useTrilhasDoConteudo } from "../api/conteudos.queries";
import { legendaCurtaConteudo } from "../lib/legenda-conteudo";
import { caminhoDaTrilha, caminhoDoConteudo } from "../lib/origem-catalogo";
import type { ItemCatalogo } from "../tipos/conteudo";
import type { TrilhaDoConteudo } from "../tipos/trilha";
import { BarraProgressoTrilha } from "./BarraProgressoTrilha";
import { MiniaturaConteudo } from "./MiniaturaConteudo";

function ItemProximo({ item, origem }: { item: ItemCatalogo; origem: string }) {
  const conteudo = (
    <>
      <MiniaturaConteudo tipo={item.tipo} borrada={item.bloqueado} />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-corpo-pequeno font-medium break-words text-texto-primario">
          {item.titulo}
        </span>
        <span className="text-legenda text-texto-secundario">{legendaCurtaConteudo(item)}</span>
      </span>
    </>
  );
  const classes = "flex items-center gap-3 rounded-md bg-neutro-100 px-3 py-2.5";

  if (item.bloqueado) return <div className={classes}>{conteudo}</div>;
  return (
    <Link
      href={caminhoDoConteudo(item.id_conteudo, origem)}
      className={`${classes} hover:bg-violeta-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acao-destaque`}
    >
      {conteudo}
    </Link>
  );
}

function BlocoTrilha({ trilha, origem }: { trilha: TrilhaDoConteudo; origem: string }) {
  const { id_trilha, titulo, posicao, total_itens, itens_vistos, proximo } = trilha;

  return (
    <section
      aria-label={`Trilha ${titulo}`}
      className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0"
    >
      <h3 className="font-bold break-words">{titulo}</h3>
      <BarraProgressoTrilha titulo={titulo} vistos={itens_vistos} total={total_itens} />
      <p className="text-legenda text-texto-secundario">
        Item {posicao} de {total_itens} · {itens_vistos} de {total_itens} concluídos
      </p>
      {proximo ? (
        <>
          <p className="text-legenda font-medium text-texto-secundario">Próximo</p>
          <ItemProximo item={proximo} origem={origem} />
        </>
      ) : (
        <p className="text-corpo-pequeno text-texto-secundario">Este é o último item da trilha.</p>
      )}
      <Link
        href={caminhoDaTrilha(id_trilha)}
        className="self-start text-rotulo text-texto-marca hover:underline"
      >
        Ver trilha completa<span className="sr-only">: {titulo}</span>
        <span aria-hidden="true"> ›</span>
      </Link>
    </section>
  );
}

type PropsCartaoContinueTrilha = { idConteudo: string; origem: string };

export function CartaoContinueTrilha({ idConteudo, origem }: PropsCartaoContinueTrilha) {
  const { data: trilhas } = useTrilhasDoConteudo(idConteudo);
  if (!trilhas || trilhas.length === 0) return null;

  return (
    <Cartao className="flex flex-col gap-4 p-5.5">
      <h2 className="text-h3">Continue na trilha</h2>
      <div className="flex flex-col divide-y divide-borda-padrao">
        {trilhas.map((trilha) => (
          <BlocoTrilha key={trilha.id_trilha} trilha={trilha} origem={origem} />
        ))}
      </div>
    </Cartao>
  );
}
