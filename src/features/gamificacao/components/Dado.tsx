"use client";

import Image from "next/image";

import { useConsultaMidia } from "@/shared/hooks/useConsultaMidia";
import { cn } from "@/shared/ui";

export const MOVIMENTO_REDUZIDO = "(prefers-reduced-motion: reduce)";

type PropsDado = {
  rotulo: string;
  aoClicar: () => void;
  rolando?: boolean;
  desabilitado?: boolean;
  className?: string;
};

export function Dado({ rotulo, aoClicar, rolando = false, desabilitado, className }: PropsDado) {
  const movimentoReduzido = useConsultaMidia(MOVIMENTO_REDUZIDO);
  const animando = rolando && !movimentoReduzido;

  return (
    <button
      type="button"
      aria-label={rotulo}
      aria-busy={rolando}
      disabled={desabilitado || rolando}
      onClick={aoClicar}
      data-animando={animando}
      className={cn(
        "group relative flex size-50 shrink-0 cursor-pointer items-center justify-center rounded-pill md:size-65",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acao-destaque",
        "disabled:cursor-wait",
        className,
      )}
    >
      <Image
        src="/gamificacao/dado-anel.png"
        alt=""
        width={260}
        height={260}
        className="absolute inset-0 size-full"
      />
      <Image
        src="/gamificacao/dado-sombra.svg"
        alt=""
        width={246}
        height={72}
        className="absolute -bottom-9 left-1/2 w-40 max-w-none -translate-x-1/2 md:-bottom-12 md:w-61"
      />
      <span
        aria-hidden="true"
        className={cn(
          "relative block rotate-9 text-[110px] leading-none transition-transform [text-shadow:0_18px_30px_rgb(79_23_168/0.45)] md:text-[176px]",
          !rolando && "group-hover:-translate-y-1 group-hover:rotate-0",
          animando && "animate-rolar-dado",
        )}
      >
        🎲
      </span>
    </button>
  );
}
