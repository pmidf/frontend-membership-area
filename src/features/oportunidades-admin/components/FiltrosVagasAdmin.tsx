"use client";

import { rotulosSituacaoOportunidade } from "@/features/oportunidades/lib/rotulos";
import {
  SITUACOES_OPORTUNIDADE,
  type SituacaoOportunidade,
} from "@/features/oportunidades/tipos/oportunidade";
import { CampoBusca, FiltrosChip } from "@/shared/ui";

import { TAMANHO_MAXIMO_BUSCA } from "../lib/filtros-url";

const TODAS = "TODAS";

const opcoesSituacao = [
  { valor: TODAS, rotulo: "Todas" },
  ...SITUACOES_OPORTUNIDADE.map((valor) => ({
    valor,
    rotulo: rotulosSituacaoOportunidade[valor].rotulo,
  })),
];

type PropsFiltrosVagasAdmin = {
  situacao: SituacaoOportunidade | "";
  valorInicialBusca: string;
  aoBuscar: (termo: string) => void;
  aoFiltrarSituacao: (situacao: string) => void;
};

export function FiltrosVagasAdmin({
  situacao,
  valorInicialBusca,
  aoBuscar,
  aoFiltrarSituacao,
}: PropsFiltrosVagasAdmin) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <CampoBusca
        rotulo="Buscar por título ou empresa"
        placeholder="Buscar por título ou empresa"
        valorInicial={valorInicialBusca}
        maxLength={TAMANHO_MAXIMO_BUSCA}
        aoBuscar={aoBuscar}
        className="lg:w-96"
      />
      <FiltrosChip
        rotulo="Filtrar por status"
        opcoes={opcoesSituacao}
        selecionados={[situacao || TODAS]}
        aoMudar={([valor]) => aoFiltrarSituacao(valor === TODAS ? "" : valor)}
      />
    </div>
  );
}
