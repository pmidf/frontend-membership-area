import { useId, type ComponentProps, type ReactNode } from "react";

import { cn } from "../lib/cn";

export type PropsInterruptor = Omit<ComponentProps<"input">, "type" | "role"> & {
  rotulo: ReactNode;
  descricao?: ReactNode;
};

export function Interruptor({ rotulo, descricao, id, className, ...props }: PropsInterruptor) {
  const gerado = useId();
  const idCampo = id ?? gerado;
  const idDescricao = `${idCampo}-descricao`;

  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="flex flex-col gap-0.5">
        <label htmlFor={idCampo} className="cursor-pointer text-corpo-pequeno font-medium">
          {rotulo}
        </label>
        {descricao && (
          <p id={idDescricao} className="text-legenda text-texto-secundario">
            {descricao}
          </p>
        )}
      </div>
      <span className="relative inline-flex shrink-0">
        <input
          id={idCampo}
          type="checkbox"
          role="switch"
          aria-describedby={descricao ? idDescricao : undefined}
          className="peer absolute inset-0 z-10 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          {...props}
        />
        <span
          aria-hidden="true"
          className={cn(
            "h-6 w-11 rounded-pill bg-borda-padrao transition-colors",
            "peer-checked:bg-acao-primaria peer-disabled:opacity-50",
            "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-acao-destaque",
            "after:absolute after:top-1 after:left-1 after:size-4 after:rounded-pill after:bg-branco after:transition-transform",
            "peer-checked:after:translate-x-5",
          )}
        />
      </span>
    </div>
  );
}
