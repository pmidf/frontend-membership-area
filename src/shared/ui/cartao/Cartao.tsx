import type { ComponentProps } from "react";

import { cn } from "../lib/cn";

type PropsCartao = ComponentProps<"div"> & {
  interativo?: boolean;
};

export function Cartao({ interativo = false, className, ...props }: PropsCartao) {
  return (
    <div
      className={cn(
        "rounded-lg border border-borda-padrao bg-fundo-superficie",
        interativo &&
          "transition-shadow focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-acao-destaque hover:shadow-md",
        className,
      )}
      {...props}
    />
  );
}
