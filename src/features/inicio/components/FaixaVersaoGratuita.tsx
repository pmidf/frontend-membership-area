import { useId } from "react";

import { BotaoQueroSerFiliado } from "@/features/conversao/components/BotaoQueroSerFiliado";

export function FaixaVersaoGratuita() {
  const idTitulo = useId();

  return (
    <section
      aria-labelledby={idTitulo}
      className="flex flex-col gap-4 rounded-lg border border-violeta-300 bg-violeta-50 p-5 md:flex-row md:items-center md:justify-between"
    >
      <div className="flex flex-col gap-1">
        <h2 id={idTitulo} className="text-corpo font-bold text-texto-marca">
          Você está vendo a versão gratuita
        </h2>
        <p className="text-corpo-pequeno text-texto-secundario">
          Filiando-se ao PMI-DF você libera o clube de vantagens, o conteúdo exclusivo e as
          conquistas do capítulo.
        </p>
      </div>
      <BotaoQueroSerFiliado rotulo="Quero me filiar" tamanho="sm" className="shrink-0" />
    </section>
  );
}
