import type { ComponentProps, ReactNode } from "react";

import { classesEntrada } from "../campo/classes-entrada";
import { EstruturaCampo } from "../campo/EstruturaCampo";
import { useIdsCampo } from "../campo/useIdsCampo";

export type PropsCampoTexto = ComponentProps<"input"> & {
  rotulo: ReactNode;
  ajuda?: ReactNode;
  erro?: string;
  iconeDireita?: ReactNode;
};

export function CampoTexto({
  rotulo,
  ajuda,
  erro,
  iconeDireita,
  id,
  className,
  ...props
}: PropsCampoTexto) {
  const ids = useIdsCampo(id, Boolean(ajuda), Boolean(erro));

  return (
    <EstruturaCampo {...ids} rotulo={rotulo} ajuda={ajuda} erro={erro} className={className}>
      <div className="relative">
        <input
          id={ids.idCampo}
          aria-invalid={erro ? true : undefined}
          aria-describedby={ids.descricao}
          className={classesEntrada(Boolean(erro), iconeDireita ? "h-12 pr-12" : "h-12")}
          {...props}
        />
        {iconeDireita && (
          <span className="absolute inset-y-0 right-2 flex items-center">{iconeDireita}</span>
        )}
      </div>
    </EstruturaCampo>
  );
}
