"use client";

import type { SituacaoPublicacao } from "@/shared/publicacao/situacao";
import { Indicador } from "@/shared/ui";

import { useTotalConteudos } from "../api/conteudos-admin.queries";

function IndicadorSituacao({ situacao, rotulo }: { situacao: SituacaoPublicacao; rotulo: string }) {
  const total = useTotalConteudos(situacao);
  return <Indicador rotulo={rotulo} valor={total.data} carregando={total.isPending} />;
}

export function IndicadoresConteudos() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:max-w-lg">
      <IndicadorSituacao situacao="PUBLICADO" rotulo="Publicados" />
      <IndicadorSituacao situacao="RASCUNHO" rotulo="Rascunhos" />
    </div>
  );
}
