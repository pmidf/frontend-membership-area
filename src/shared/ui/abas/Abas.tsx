"use client";

import { useId, useRef, type KeyboardEvent, type ReactNode } from "react";

import { cn } from "../lib/cn";

export type Aba<V extends string> = { valor: V; rotulo: ReactNode; conteudo: ReactNode };

type PropsAbas<V extends string> = {
  rotulo: string;
  abas: Aba<V>[];
  ativa: V;
  aoMudar: (valor: V) => void;
  className?: string;
};

export function Abas<V extends string>({ rotulo, abas, ativa, aoMudar, className }: PropsAbas<V>) {
  const base = useId();
  const botoes = useRef<(HTMLButtonElement | null)[]>([]);
  const indiceAtivo = Math.max(
    0,
    abas.findIndex((aba) => aba.valor === ativa),
  );

  function selecionar(indice: number) {
    const ajustado = (indice + abas.length) % abas.length;
    aoMudar(abas[ajustado].valor);
    botoes.current[ajustado]?.focus();
  }

  function aoPressionar(evento: KeyboardEvent<HTMLButtonElement>) {
    const destinos: Record<string, number> = {
      ArrowRight: indiceAtivo + 1,
      ArrowLeft: indiceAtivo - 1,
      Home: 0,
      End: abas.length - 1,
    };
    if (!(evento.key in destinos)) return;
    evento.preventDefault();
    selecionar(destinos[evento.key]);
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div role="tablist" aria-label={rotulo} className="flex gap-6 border-b border-borda-padrao">
        {abas.map((aba, indice) => {
          const selecionada = indice === indiceAtivo;
          return (
            <button
              key={aba.valor}
              ref={(elemento) => {
                botoes.current[indice] = elemento;
              }}
              type="button"
              role="tab"
              id={`${base}-aba-${aba.valor}`}
              aria-selected={selecionada}
              aria-controls={`${base}-painel-${aba.valor}`}
              tabIndex={selecionada ? 0 : -1}
              onClick={() => aoMudar(aba.valor)}
              onKeyDown={aoPressionar}
              className={cn(
                "-mb-px border-b-2 px-1 pb-3 text-corpo-pequeno font-medium transition-colors focus-visible:outline-2 focus-visible:outline-acao-destaque",
                selecionada
                  ? "border-acao-primaria text-texto-marca"
                  : "border-transparent text-texto-secundario hover:text-texto-primario",
              )}
            >
              {aba.rotulo}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${base}-painel-${abas[indiceAtivo].valor}`}
        aria-labelledby={`${base}-aba-${abas[indiceAtivo].valor}`}
        tabIndex={0}
      >
        {abas[indiceAtivo].conteudo}
      </div>
    </div>
  );
}
