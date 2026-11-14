import { Lock } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/shared/ui/lib/cn";

import { BotaoQueroSerFiliado } from "./BotaoQueroSerFiliado";

type PropsBloqueioSecao = {
  titulo: ReactNode;
  descricao: ReactNode;
  rotuloCta?: string;
  children: ReactNode;
  className?: string;
};

export function BloqueioSecao({
  titulo,
  descricao,
  rotuloCta = "Quero me filiar",
  children,
  className,
}: PropsBloqueioSecao) {
  return (
    <div className={cn("grid overflow-hidden rounded-lg", className)}>
      <div
        inert
        aria-hidden="true"
        className="pointer-events-none col-start-1 row-start-1 blur-sm select-none"
      >
        {children}
      </div>
      <div className="relative col-start-1 row-start-1 flex items-center justify-center p-4">
        <section
          aria-label="Conteúdo bloqueado"
          className="flex max-w-sm flex-col items-center gap-3 rounded-lg bg-fundo-superficie p-6 text-center shadow-lg"
        >
          <span className="flex size-10 items-center justify-center rounded-pill bg-violeta-50">
            <Lock aria-hidden="true" className="size-5 text-texto-marca" />
          </span>
          <h3 className="text-h3">{titulo}</h3>
          <p className="text-corpo-pequeno text-texto-secundario">{descricao}</p>
          <BotaoQueroSerFiliado rotulo={rotuloCta} larguraTotal />
        </section>
      </div>
    </div>
  );
}
