import { cn } from "@/shared/ui";

import { capasPorTipo } from "../lib/tipo-conteudo";
import type { TipoConteudo } from "../tipos/conteudo";

type PropsMiniaturaConteudo = {
  tipo: TipoConteudo;
  borrada?: boolean;
  className?: string;
};

export function MiniaturaConteudo({ tipo, borrada = false, className }: PropsMiniaturaConteudo) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block h-10 w-14 shrink-0 rounded-sm bg-linear-158 to-70%",
        capasPorTipo[tipo],
        borrada && "blur-xs",
        className,
      )}
    />
  );
}
