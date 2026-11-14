import { Inbox, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "../lib/cn";

type PropsEstadoVazio = {
  titulo: ReactNode;
  descricao?: ReactNode;
  acao?: ReactNode;
  icone?: LucideIcon;
  className?: string;
};

export function EstadoVazio({
  titulo,
  descricao,
  acao,
  icone: Icone = Inbox,
  className,
}: PropsEstadoVazio) {
  return (
    <div className={cn("flex flex-col items-center gap-3 px-4 py-12 text-center", className)}>
      <span className="flex size-12 items-center justify-center rounded-pill bg-violeta-50">
        <Icone aria-hidden="true" className="size-6 text-texto-marca" />
      </span>
      <p className="text-h3">{titulo}</p>
      {descricao && (
        <p className="max-w-md text-corpo-pequeno text-texto-secundario">{descricao}</p>
      )}
      {acao}
    </div>
  );
}
