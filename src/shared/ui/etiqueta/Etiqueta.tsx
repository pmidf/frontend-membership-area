import type { ReactNode } from "react";

import { cn } from "../lib/cn";
import { classesTom, type Tom } from "../lib/tons";

type PropsEtiqueta = {
  tom?: Tom;
  children: ReactNode;
  className?: string;
};

export function Etiqueta({ tom = "violeta", children, className }: PropsEtiqueta) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-legenda font-medium",
        classesTom[tom],
        className,
      )}
    >
      {children}
    </span>
  );
}
