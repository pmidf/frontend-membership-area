"use client";

import { Route } from "lucide-react";
import Link from "next/link";

import { Cartao } from "@/shared/ui";

import { caminhoDaTrilha } from "../lib/origem-catalogo";
import { legendaProgresso } from "../lib/progresso-trilha";
import { useOrigemAtual } from "../lib/useOrigemAtual";
import type { ResumoTrilha } from "../tipos/trilha";
import { BarraProgressoTrilha } from "./BarraProgressoTrilha";

export function CartaoTrilha({ trilha }: { trilha: ResumoTrilha }) {
  const { id_trilha, titulo, descricao, total_itens, itens_vistos } = trilha;
  const origem = useOrigemAtual();

  return (
    <Cartao interativo className="relative flex h-full flex-col gap-2.5 p-4">
      <p className="flex items-center gap-2 text-legenda font-medium text-texto-marca">
        <span className="inline-flex size-8 items-center justify-center rounded-pill bg-violeta-50">
          <Route aria-hidden="true" className="size-4" />
        </span>
        Trilha · {total_itens === 1 ? "1 item" : `${total_itens} itens`}
      </p>
      <h3 className="text-corpo font-bold break-words">
        <Link
          href={caminhoDaTrilha(id_trilha, origem)}
          className="after:absolute after:inset-0 focus-visible:outline-none"
        >
          {titulo}
        </Link>
      </h3>
      <p className="line-clamp-2 text-corpo-pequeno text-texto-secundario">{descricao}</p>
      <div className="mt-auto flex flex-col gap-2 pt-1">
        <BarraProgressoTrilha titulo={titulo} vistos={itens_vistos} total={total_itens} />
        <p className="text-legenda text-texto-secundario">
          {legendaProgresso(itens_vistos, total_itens)}
        </p>
      </div>
    </Cartao>
  );
}

export function GradeTrilhas({ trilhas }: { trilhas: ResumoTrilha[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {trilhas.map((trilha) => (
        <li key={trilha.id_trilha}>
          <CartaoTrilha trilha={trilha} />
        </li>
      ))}
    </ul>
  );
}
