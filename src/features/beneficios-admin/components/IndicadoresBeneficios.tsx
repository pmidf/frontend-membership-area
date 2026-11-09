"use client";

import { Cartao, Esqueleto } from "@/shared/ui";

import { useTotalPorSituacao } from "../api/beneficios-admin.queries";
import type { SituacaoBeneficio } from "../tipos/beneficio-admin";

function Indicador({ situacao, rotulo }: { situacao: SituacaoBeneficio; rotulo: string }) {
  const total = useTotalPorSituacao(situacao);

  return (
    <Cartao className="flex flex-col gap-1 p-5">
      {total.isPending ? (
        <Esqueleto variante="linha" rotulo={`Carregando ${rotulo.toLowerCase()}…`} />
      ) : (
        <p className="text-h2 text-texto-marca">{total.data ?? "—"}</p>
      )}
      <p className="text-corpo-pequeno text-texto-secundario">{rotulo}</p>
    </Cartao>
  );
}

export function IndicadoresBeneficios() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:max-w-lg">
      <Indicador situacao="PUBLICADO" rotulo="Publicados" />
      <Indicador situacao="RASCUNHO" rotulo="Em rascunho" />
    </div>
  );
}
