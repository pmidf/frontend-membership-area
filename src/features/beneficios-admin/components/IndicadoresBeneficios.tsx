"use client";

import { Indicador } from "@/shared/ui";

import { useRelatorioResgates, useTotalPorSituacao } from "../api/beneficios-admin.queries";
import { anoAtual } from "../lib/relatorio-resgates";
import type { SituacaoBeneficio } from "../tipos/beneficio-admin";

function IndicadorSituacao({ situacao, rotulo }: { situacao: SituacaoBeneficio; rotulo: string }) {
  const total = useTotalPorSituacao(situacao);
  return <Indicador rotulo={rotulo} valor={total.data} carregando={total.isPending} />;
}

function IndicadorResgatesDoAno() {
  const ano = anoAtual();
  const relatorio = useRelatorioResgates(ano);
  return (
    <Indicador
      rotulo={`Resgates em ${ano}`}
      valor={relatorio.data?.total_resgates}
      carregando={relatorio.isPending}
    />
  );
}

export function IndicadoresBeneficios() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:max-w-3xl lg:grid-cols-3">
      <IndicadorSituacao situacao="PUBLICADO" rotulo="Publicados" />
      <IndicadorSituacao situacao="RASCUNHO" rotulo="Em rascunho" />
      <IndicadorResgatesDoAno />
    </div>
  );
}
