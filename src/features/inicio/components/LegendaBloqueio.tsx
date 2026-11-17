import { Lock } from "lucide-react";

export function LegendaBloqueio({ children }: { children: string }) {
  return (
    <p className="mt-2 flex items-center gap-1.5 text-legenda text-texto-secundario">
      <Lock aria-hidden="true" className="size-3.5 shrink-0 text-texto-marca" />
      {children}
    </p>
  );
}
