"use client";

import { X } from "lucide-react";
import { useFormContext, type UseFieldArrayReturn } from "react-hook-form";

import { MiniaturaConteudo } from "@/features/conteudos/components/MiniaturaConteudo";
import { Cartao } from "@/shared/ui";

import { legendaItemTrilha } from "../lib/valores-trilha";
import type { DadosTrilha } from "../schemas/trilha.schema";
import { BotaoOrdem } from "./BotaoOrdem";

export type ListaItensTrilha = UseFieldArrayReturn<DadosTrilha, "itens", "chave">;

type PropsItensTrilha = {
  itens: ListaItensTrilha;
  aoAdicionar: () => void;
};

export function ItensTrilha({ itens: { fields, move, remove }, aoAdicionar }: PropsItensTrilha) {
  const {
    formState: { errors },
  } = useFormContext<DadosTrilha>();
  const erro = errors.itens?.message ?? errors.itens?.root?.message;

  return (
    <Cartao className="flex flex-col gap-4 p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-h3">Conteúdos da trilha</h2>
        <p className="text-corpo-pequeno text-texto-secundario">
          Use as setas para mudar a ordem. A trilha é concluída quando todos os itens forem
          assistidos ou lidos.
        </p>
      </div>
      {fields.length === 0 ? (
        <p className="text-corpo-pequeno text-texto-secundario">Nenhum conteúdo na trilha ainda.</p>
      ) : (
        <ol aria-label="Conteúdos na ordem da trilha" className="flex flex-col gap-2">
          {fields.map((item, indice) => (
            <li
              key={item.chave}
              className="flex flex-wrap items-center gap-3 rounded-md bg-violeta-50 px-3 py-2.5"
            >
              <span
                aria-hidden="true"
                className="inline-flex size-6 shrink-0 items-center justify-center rounded-pill bg-acao-primaria text-legenda font-bold text-texto-inverso"
              >
                {indice + 1}
              </span>
              <MiniaturaConteudo tipo={item.tipo} className="max-sm:hidden" />
              <div className="min-w-0 flex-1">
                <p className="text-corpo-pequeno font-medium break-words">{item.titulo}</p>
                <p className="text-legenda text-texto-secundario">{legendaItemTrilha(item)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2 max-sm:w-full max-sm:justify-end">
                <BotaoOrdem
                  direcao="subir"
                  nome={item.titulo}
                  desabilitado={indice === 0}
                  aoClicar={() => move(indice, indice - 1)}
                />
                <BotaoOrdem
                  direcao="descer"
                  nome={item.titulo}
                  desabilitado={indice === fields.length - 1}
                  aoClicar={() => move(indice, indice + 1)}
                />
                <button
                  type="button"
                  aria-label={`Remover ${item.titulo}`}
                  onClick={() => remove(indice)}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-pill text-texto-secundario hover:bg-neutro-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acao-destaque disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
      {erro && (
        <p role="alert" className="text-legenda text-texto-erro">
          {erro}
        </p>
      )}
      <button
        type="button"
        onClick={aoAdicionar}
        className="rounded-md border-[1.5px] border-dashed border-texto-marca px-4 py-3.5 text-corpo-pequeno font-medium text-texto-marca hover:bg-violeta-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acao-destaque disabled:cursor-not-allowed disabled:opacity-60"
      >
        + Adicionar conteúdo da biblioteca
      </button>
    </Cartao>
  );
}
