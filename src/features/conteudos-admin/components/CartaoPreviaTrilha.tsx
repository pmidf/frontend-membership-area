"use client";

import { useFormContext, useWatch } from "react-hook-form";

import { MiniaturaConteudo } from "@/features/conteudos/components/MiniaturaConteudo";
import { Cartao } from "@/shared/ui";

import { legendaItemTrilha } from "../lib/valores-trilha";
import type { DadosTrilha } from "../schemas/trilha.schema";

export function CartaoPreviaTrilha() {
  const { control } = useFormContext<DadosTrilha>();
  const [titulo, itens] = useWatch({ control, name: ["titulo", "itens"] });
  const visiveis = itens.filter(({ situacao }) => situacao === "PUBLICADO");
  const ocultos = itens.length - visiveis.length;

  return (
    <Cartao className="flex flex-col gap-4 p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-h3">Prévia da trilha</h2>
        <p className="text-corpo-pequeno text-texto-secundario">
          Como os membros vão ver a sequência na página da trilha.
        </p>
      </div>
      <p className="font-bold break-words">{titulo.trim() || "Trilha sem título"}</p>
      {visiveis.length === 0 ? (
        <p className="text-corpo-pequeno text-texto-secundario">
          Nenhum conteúdo publicado na trilha ainda.
        </p>
      ) : (
        <ol aria-label="Prévia dos conteúdos" className="flex flex-col gap-3">
          {visiveis.map((item) => (
            <li key={item.id_conteudo} className="flex items-center gap-3">
              <MiniaturaConteudo tipo={item.tipo} />
              <div className="min-w-0">
                <p className="text-corpo-pequeno font-medium break-words">{item.titulo}</p>
                <p className="text-legenda text-texto-secundario">{legendaItemTrilha(item)}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
      {ocultos > 0 && (
        <p className="text-legenda text-texto-secundario">
          {ocultos === 1
            ? "1 conteúdo em rascunho fica oculto até ser publicado."
            : `${ocultos} conteúdos em rascunho ficam ocultos até serem publicados.`}
        </p>
      )}
    </Cartao>
  );
}
