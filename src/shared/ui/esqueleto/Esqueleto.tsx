import type { ReactElement } from "react";

import { cn } from "../lib/cn";

type Variante = "bloco" | "linha" | "circulo" | "cartao" | "tabela";

type PropsEsqueleto = {
  variante?: Variante;
  quantidade?: number;
  rotulo?: string;
  className?: string;
};

function Bloco({ className }: { className?: string }) {
  return <span className={cn("block animate-pulse rounded-md bg-borda-padrao/60", className)} />;
}

function Cartao() {
  return (
    <span className="flex flex-col gap-3 rounded-lg border border-borda-padrao bg-fundo-superficie p-4">
      <Bloco className="h-28" />
      <Bloco className="h-4 w-1/3" />
      <Bloco className="h-5 w-4/5" />
      <Bloco className="h-4 w-1/2" />
    </span>
  );
}

function LinhaTabela() {
  return (
    <span className="flex gap-4 border-b border-borda-padrao py-4">
      <Bloco className="h-4 flex-2" />
      <Bloco className="h-4 flex-1" />
      <Bloco className="h-4 flex-1" />
    </span>
  );
}

const formas: Record<Variante, () => ReactElement> = {
  bloco: () => <Bloco className="h-24" />,
  linha: () => <Bloco className="h-4" />,
  circulo: () => <Bloco className="size-10 rounded-pill" />,
  cartao: Cartao,
  tabela: LinhaTabela,
};

export function Esqueleto({
  variante = "bloco",
  quantidade = 1,
  rotulo = "Carregando…",
  className,
}: PropsEsqueleto) {
  const Forma = formas[variante];

  return (
    <div role="status" aria-busy="true" className={cn("flex flex-col gap-3", className)}>
      <span className="sr-only">{rotulo}</span>
      <span aria-hidden="true" className="contents">
        {Array.from({ length: quantidade }, (_, indice) => (
          <Forma key={indice} />
        ))}
      </span>
    </div>
  );
}
