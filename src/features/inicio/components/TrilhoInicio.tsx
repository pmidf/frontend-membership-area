import type { ReactNode } from "react";

import { cn } from "@/shared/ui";

type PropsTrilhoInicio = {
  rotulo: string;
  focavel?: boolean;
  children: ReactNode;
};

export function TrilhoInicio({ rotulo, focavel = false, children }: PropsTrilhoInicio) {
  return (
    <ul
      aria-label={rotulo}
      tabIndex={focavel ? 0 : undefined}
      data-trilho=""
      className={cn(
        "-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2",
        "md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0",
        focavel &&
          "rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acao-destaque",
      )}
    >
      {children}
    </ul>
  );
}

export function ItemTrilho({ children }: { children: ReactNode }) {
  return <li className="w-[85%] shrink-0 snap-start md:w-auto">{children}</li>;
}
