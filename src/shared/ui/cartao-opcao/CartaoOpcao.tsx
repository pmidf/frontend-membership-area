import type { ComponentProps, ReactNode } from "react";

import { cn } from "../lib/cn";

export type PropsCartaoOpcao = Omit<ComponentProps<"input">, "type"> & {
  rotulo: ReactNode;
  descricao?: ReactNode;
};

export function CartaoOpcao({ rotulo, descricao, className, ...props }: PropsCartaoOpcao) {
  return (
    <label
      className={cn(
        "group flex cursor-pointer items-start gap-3 rounded-md border border-borda-padrao bg-fundo-superficie p-4 transition-colors",
        "has-[:checked]:border-acao-primaria has-[:checked]:bg-violeta-50",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-acao-destaque",
        "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60",
        className,
      )}
    >
      <input type="radio" className="sr-only" {...props} />
      <span
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0 rounded-pill border-2 border-borda-padrao bg-branco group-has-[:checked]:border-[5px] group-has-[:checked]:border-acao-primaria"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-corpo-pequeno font-medium text-texto-primario">{rotulo}</span>
        {descricao && <span className="text-legenda text-texto-secundario">{descricao}</span>}
      </span>
    </label>
  );
}
