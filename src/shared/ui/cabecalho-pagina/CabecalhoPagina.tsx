import type { ReactNode } from "react";

import { cn } from "../lib/cn";

type PropsCabecalhoPagina = {
  titulo: ReactNode;
  subtitulo?: ReactNode;
  acoes?: ReactNode;
  className?: string;
};

export function CabecalhoPagina({ titulo, subtitulo, acoes, className }: PropsCabecalhoPagina) {
  return (
    <header
      className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-h2 md:text-display">{titulo}</h1>
        {subtitulo && <p className="text-corpo text-texto-secundario">{subtitulo}</p>}
      </div>
      {acoes && <div className="flex flex-wrap gap-3">{acoes}</div>}
    </header>
  );
}
