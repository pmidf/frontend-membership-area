import { useId, type ComponentProps, type ReactNode } from "react";

import { cn } from "../lib/cn";

export type PropsCaixaSelecao = Omit<ComponentProps<"input">, "type"> & {
  rotulo: ReactNode;
  erro?: string;
};

export function CaixaSelecao({ rotulo, erro, id, className, ...props }: PropsCaixaSelecao) {
  const gerado = useId();
  const idCampo = id ?? gerado;
  const idErro = `${idCampo}-erro`;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-start gap-3">
        <input
          id={idCampo}
          type="checkbox"
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? idErro : undefined}
          className="mt-0.5 size-5 shrink-0 cursor-pointer rounded-sm accent-acao-primaria focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acao-destaque"
          {...props}
        />
        <label
          htmlFor={idCampo}
          className="cursor-pointer text-corpo-pequeno text-texto-secundario"
        >
          {rotulo}
        </label>
      </div>
      {erro && (
        <p id={idErro} className="text-legenda text-texto-erro">
          {erro}
        </p>
      )}
    </div>
  );
}
