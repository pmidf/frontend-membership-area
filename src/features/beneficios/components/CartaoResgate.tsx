import type { ReactNode } from "react";

import { formatarDataCivil } from "@/shared/lib/datas";
import { Cartao } from "@/shared/ui";

import { rotulosTipoResgate } from "../lib/rotulos-beneficio";
import type { DetalheBeneficio } from "../tipos/beneficio";

type PropsCartaoResgate = {
  beneficio: DetalheBeneficio;
  children?: ReactNode;
};

export function CartaoResgate({ beneficio, children }: PropsCartaoResgate) {
  const { tipo_resgate, vigencia_fim } = beneficio;

  return (
    <Cartao className="flex flex-col gap-4 p-6">
      <h2 className="text-h3">Resgatar vantagem</h2>
      <p className="text-corpo-pequeno text-texto-secundario">{rotulosTipoResgate[tipo_resgate]}</p>
      <dl className="flex items-center justify-between gap-3 text-corpo-pequeno">
        <dt className="text-texto-secundario">Válido até</dt>
        <dd className="font-medium">
          {vigencia_fim ? formatarDataCivil(vigencia_fim) : "Sem data de término"}
        </dd>
      </dl>
      {children}
      <p className="text-legenda text-texto-secundario">
        Ao resgatar, registramos data, hora e seu status de filiação no momento da ação. Isso serve
        de comprovação junto ao parceiro.
      </p>
    </Cartao>
  );
}
