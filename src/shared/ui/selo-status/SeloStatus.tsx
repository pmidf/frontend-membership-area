import type { ReactNode } from "react";

import { cn } from "../lib/cn";
import { classesPontoTom, classesTom, type Tom } from "../lib/tons";

type PropsSeloStatus = {
  tom?: Tom;
  children: ReactNode;
  className?: string;
};

export function SeloStatus({ tom = "neutro", children, className }: PropsSeloStatus) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 text-legenda font-medium whitespace-nowrap",
        classesTom[tom],
        className,
      )}
    >
      <span aria-hidden="true" className={cn("size-1.5 rounded-pill", classesPontoTom[tom])} />
      {children}
    </span>
  );
}
