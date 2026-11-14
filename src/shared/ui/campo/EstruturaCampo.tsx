import type { ReactNode } from "react";

import { cn } from "../lib/cn";

type PropsEstruturaCampo = {
  idCampo: string;
  idAjuda: string;
  idErro: string;
  rotulo: ReactNode;
  ajuda?: ReactNode;
  erro?: string;
  rodape?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function EstruturaCampo({
  idCampo,
  idAjuda,
  idErro,
  rotulo,
  ajuda,
  erro,
  rodape,
  className,
  children,
}: PropsEstruturaCampo) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={idCampo} className="text-rotulo text-texto-primario">
        {rotulo}
      </label>
      {children}
      <div className="flex items-start justify-between gap-2">
        {erro ? (
          <p id={idErro} className="text-legenda text-texto-erro">
            {erro}
          </p>
        ) : (
          ajuda && (
            <p id={idAjuda} className="text-legenda text-texto-secundario">
              {ajuda}
            </p>
          )
        )}
        {rodape}
      </div>
    </div>
  );
}
