import type { ReactNode } from "react";

import { cn } from "@/shared/ui";

import { TOTAL_PECAS } from "../tipos/gamificacao";

export const classesCartaoCatalogo =
  "flex h-full w-full items-center overflow-hidden rounded-md border border-borda-padrao bg-fundo-superficie text-left md:flex-col md:items-stretch md:rounded-lg";

export const classesMidiaCatalogo =
  "relative m-[7px] size-[58px] shrink-0 overflow-hidden rounded-[10px] md:m-0 md:h-35 md:w-full md:rounded-none";

export function SeloPecas() {
  return (
    <span className="absolute top-3 right-3 hidden rounded-pill bg-black/45 px-2 py-0.5 text-[11px] leading-normal font-medium text-branco md:inline">
      {TOTAL_PECAS} peças
    </span>
  );
}

type PropsTextoCatalogo = {
  titulo: ReactNode;
  detalhe: ReactNode;
  classeDetalhe?: string;
};

export function TextoCatalogo({ titulo, detalhe, classeDetalhe }: PropsTextoCatalogo) {
  return (
    <span className="flex min-w-0 flex-col gap-1 px-2 py-3 md:p-4">
      <span className="truncate text-corpo-pequeno font-medium md:text-[15px] md:font-bold">
        {titulo}
      </span>
      <span className={cn("text-legenda font-medium", classeDetalhe)}>{detalhe}</span>
    </span>
  );
}
