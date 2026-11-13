"use client";

import { Indicador } from "@/shared/ui";

import { useTotalPorSituacao } from "../api/beneficios-admin.queries";
import type { SituacaoBeneficio } from "../tipos/beneficio-admin";

function IndicadorSituacao({ situacao, rotulo }: { situacao: SituacaoBeneficio; rotulo: string }) {
  const total = useTotalPorSituacao(situacao);
  return <Indicador rotulo={rotulo} valor={total.data} carregando={total.isPending} />;
}

export function IndicadoresBeneficios() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:max-w-lg">
      <IndicadorSituacao situacao="PUBLICADO" rotulo="Publicados" />
      <IndicadorSituacao situacao="RASCUNHO" rotulo="Em rascunho" />
    </div>
  );
}
