import type { ReactNode } from "react";

import { cn } from "../lib/cn";

export type OpcaoChip = { valor: string; rotulo: ReactNode };

type PropsFiltrosChip = {
  rotulo: string;
  opcoes: OpcaoChip[];
  selecionados: string[];
  aoMudar: (selecionados: string[]) => void;
  multiplo?: boolean;
  desabilitado?: boolean;
  className?: string;
};

export function FiltrosChip({
  rotulo,
  opcoes,
  selecionados,
  aoMudar,
  multiplo = false,
  desabilitado = false,
  className,
}: PropsFiltrosChip) {
  function alternar(valor: string) {
    if (!multiplo) {
      aoMudar([valor]);
      return;
    }
    aoMudar(
      selecionados.includes(valor)
        ? selecionados.filter((atual) => atual !== valor)
        : [...selecionados, valor],
    );
  }

  return (
    <div role="group" aria-label={rotulo} className={cn("flex flex-wrap gap-2", className)}>
      {opcoes.map((opcao) => {
        const ativo = selecionados.includes(opcao.valor);
        return (
          <button
            key={opcao.valor}
            type="button"
            aria-pressed={ativo}
            disabled={desabilitado}
            onClick={() => alternar(opcao.valor)}
            className={cn(
              "min-h-10 rounded-pill px-4 text-corpo-pequeno transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acao-destaque disabled:cursor-not-allowed disabled:opacity-60",
              ativo
                ? "bg-acao-primaria font-medium text-texto-inverso"
                : "bg-transparent text-texto-secundario hover:bg-violeta-50",
            )}
          >
            {opcao.rotulo}
          </button>
        );
      })}
    </div>
  );
}
