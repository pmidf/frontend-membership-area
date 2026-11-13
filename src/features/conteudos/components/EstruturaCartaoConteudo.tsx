import type { ReactNode } from "react";

import { SeloExclusivo } from "@/features/conversao/components/SeloExclusivo";
import { Cartao, cn } from "@/shared/ui";

import { duracaoNaCapa } from "../lib/duracao";
import { rotulosTipo } from "../lib/tipo-conteudo";
import type { TipoConteudo } from "../tipos/conteudo";

const aparenciaPorTipo: Record<TipoConteudo, { rotulo: string; capa: string; selo: string }> = {
  VIDEO: {
    rotulo: rotulosTipo.VIDEO,
    capa: "from-violeta-800 to-violeta-500",
    selo: "bg-acao-primaria",
  },
  MATERIAL: {
    rotulo: rotulosTipo.MATERIAL,
    capa: "from-aqua-600 to-acao-destaque",
    selo: "bg-alerta-700",
  },
};

type PropsEstruturaCartaoConteudo = {
  tipo: TipoConteudo;
  duracaoSegundos?: number | null;
  interativo?: boolean;
  bloqueado?: boolean;
  children: ReactNode;
};

export function EstruturaCartaoConteudo({
  tipo,
  duracaoSegundos = null,
  interativo,
  bloqueado = false,
  children,
}: PropsEstruturaCartaoConteudo) {
  const { rotulo, capa, selo } = aparenciaPorTipo[tipo];

  return (
    <Cartao
      interativo={interativo}
      data-bloqueado={bloqueado || undefined}
      className="relative flex flex-col gap-2.5 overflow-hidden p-4 max-sm:gap-0 max-sm:p-0"
    >
      <div className="relative">
        <div
          aria-hidden={bloqueado || undefined}
          className={cn(
            "flex h-27 flex-col items-end justify-end rounded-md bg-linear-158 to-70% pr-2.5 pb-2.5 max-sm:h-40 max-sm:items-start max-sm:rounded-none max-sm:pl-2.5",
            capa,
            bloqueado && "blur-sm select-none",
          )}
        >
          {duracaoSegundos !== null && (
            <span className="rounded-sm bg-violeta-950/70 px-2 py-1 text-legenda text-texto-inverso max-sm:hidden">
              {duracaoNaCapa(duracaoSegundos)}
            </span>
          )}
          <span
            className={cn("rounded-sm px-2 py-1 text-legenda font-bold text-texto-inverso", selo)}
          >
            {rotulo}
          </span>
        </div>
        {bloqueado && (
          <div className="absolute inset-0 flex items-center justify-center">
            <SeloExclusivo />
          </div>
        )}
      </div>
      <div className="flex flex-col items-start gap-2.5 max-sm:gap-1 max-sm:p-3.5">{children}</div>
    </Cartao>
  );
}
