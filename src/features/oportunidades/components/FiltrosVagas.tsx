"use client";

import { CampoBusca, FiltrosChip } from "@/shared/ui";

import { TAMANHO_MAXIMO_BUSCA } from "../lib/filtros-url";
import { rotulosModalidade } from "../lib/rotulos";
import { MODALIDADES, type Modalidade } from "../tipos/oportunidade";

const TODAS = "TODAS";

const opcoesModalidade = [
  { valor: TODAS, rotulo: "Todas" },
  ...(["REMOTO", "HIBRIDO", "PRESENCIAL"] as const satisfies readonly Modalidade[]).map(
    (valor) => ({ valor, rotulo: rotulosModalidade[valor].rotulo }),
  ),
];

type PropsFiltrosVagas = {
  modalidade: Modalidade | "";
  valorInicialBusca: string;
  aoBuscar: (termo: string) => void;
  aoFiltrarModalidade: (modalidade: string) => void;
  desabilitado?: boolean;
};

export function FiltrosVagas({
  modalidade,
  valorInicialBusca,
  aoBuscar,
  aoFiltrarModalidade,
  desabilitado = false,
}: PropsFiltrosVagas) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <CampoBusca
        rotulo="Buscar por cargo ou empresa"
        placeholder="Buscar por cargo ou empresa"
        valorInicial={valorInicialBusca}
        maxLength={TAMANHO_MAXIMO_BUSCA}
        aoBuscar={aoBuscar}
        desabilitado={desabilitado}
        className="lg:flex-1"
      />
      <FiltrosChip
        rotulo="Filtrar por modalidade"
        opcoes={opcoesModalidade}
        selecionados={[modalidade || TODAS]}
        desabilitado={desabilitado}
        aoMudar={([valor]) =>
          aoFiltrarModalidade(MODALIDADES.find((opcao) => opcao === valor) ?? "")
        }
      />
    </div>
  );
}
