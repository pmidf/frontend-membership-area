"use client";

import { BotaoQueroSerFiliado } from "@/features/conversao/components/BotaoQueroSerFiliado";
import { useFocoNaAncora } from "@/shared/hooks/useFocoNaAncora";
import type { Perfil } from "@/shared/sessao/tipos";

import { CartaoSituacaoFiliacao } from "./CartaoSituacaoFiliacao";

export function SecaoFiliacao({ perfil }: { perfil: Perfil }) {
  const titulo = useFocoNaAncora<HTMLHeadingElement>("filiacao");
  const { filiado } = perfil.papeis;

  return (
    <section id="filiacao" aria-labelledby="titulo-filiacao" className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2
          ref={titulo}
          id="titulo-filiacao"
          tabIndex={-1}
          className="scroll-mt-24 text-h3 focus:outline-none"
        >
          Filiação PMI
        </h2>
        <p className="text-corpo-pequeno text-texto-secundario">
          Confirme que sua filiação está reconhecida e em dia.
        </p>
      </header>
      <CartaoSituacaoFiliacao
        filiacao={perfil.filiacao}
        filiado={filiado}
        acoes={
          !filiado && (
            <BotaoQueroSerFiliado rotulo="Quero me filiar" variante="secundario" tamanho="sm" />
          )
        }
      />
    </section>
  );
}
