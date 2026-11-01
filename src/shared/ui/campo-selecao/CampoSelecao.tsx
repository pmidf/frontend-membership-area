import { ChevronDown } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { classesEntrada } from "../campo/classes-entrada";
import { EstruturaCampo } from "../campo/EstruturaCampo";
import { useIdsCampo } from "../campo/useIdsCampo";

export type OpcaoSelecao = { valor: string; rotulo: string };

export type PropsCampoSelecao = ComponentProps<"select"> & {
  rotulo: ReactNode;
  opcoes: OpcaoSelecao[];
  textoVazio?: string;
  ajuda?: ReactNode;
  erro?: string;
};

export function CampoSelecao({
  rotulo,
  opcoes,
  textoVazio,
  ajuda,
  erro,
  id,
  className,
  ...props
}: PropsCampoSelecao) {
  const ids = useIdsCampo(id, Boolean(ajuda), Boolean(erro));

  return (
    <EstruturaCampo {...ids} rotulo={rotulo} ajuda={ajuda} erro={erro} className={className}>
      <div className="relative">
        <select
          id={ids.idCampo}
          aria-invalid={erro ? true : undefined}
          aria-describedby={ids.descricao}
          className={classesEntrada(Boolean(erro), "h-12 appearance-none pr-10")}
          {...props}
        >
          {textoVazio !== undefined && <option value="">{textoVazio}</option>}
          {opcoes.map((opcao) => (
            <option key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-texto-secundario"
        />
      </div>
    </EstruturaCampo>
  );
}
