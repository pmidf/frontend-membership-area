import { Lock } from "lucide-react";

import { cn } from "@/shared/ui/lib/cn";

export function SeloExclusivo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill bg-violeta-950/80 px-3 py-1 text-legenda font-medium text-texto-inverso",
        className,
      )}
    >
      <Lock aria-hidden="true" className="size-3.5" />
      Exclusivo para filiados
    </span>
  );
}
