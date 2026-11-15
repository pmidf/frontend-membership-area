"use client";

import type { SituacaoPublicacao } from "@/shared/publicacao/situacao";
import { Indicador } from "@/shared/ui";

type ConsultaTotal = (situacao: SituacaoPublicacao) => { data?: number; isPending: boolean };

type PropsIndicador = { situacao: SituacaoPublicacao; rotulo: string; useTotal: ConsultaTotal };

function IndicadorSituacao({ situacao, rotulo, useTotal }: PropsIndicador) {
  const total = useTotal(situacao);
  return <Indicador rotulo={rotulo} valor={total.data} carregando={total.isPending} />;
}

type PropsIndicadoresSituacao = { rotuloPublicados: string; useTotal: ConsultaTotal };

export function IndicadoresSituacao({ rotuloPublicados, useTotal }: PropsIndicadoresSituacao) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:max-w-lg">
      <IndicadorSituacao situacao="PUBLICADO" rotulo={rotuloPublicados} useTotal={useTotal} />
      <IndicadorSituacao situacao="RASCUNHO" rotulo="Rascunhos" useTotal={useTotal} />
    </div>
  );
}
