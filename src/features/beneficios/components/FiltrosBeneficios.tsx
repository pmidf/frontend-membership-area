"use client";

import { CampoBusca, FiltrosChip } from "@/shared/ui";

import { TAMANHO_MAXIMO_BUSCA, type FiltrosCatalogo } from "../lib/filtros-url";
import { rotulosCategoria } from "../lib/rotulos-beneficio";
import type { CategoriaBeneficio } from "../tipos/beneficio";

type PropsFiltrosBeneficios = {
  filtros: FiltrosCatalogo;
  categorias: CategoriaBeneficio[];
  valorInicialBusca: string;
  aoBuscar: (termo: string) => void;
  aoEscolherCategoria: (categoria: string) => void;
};

export function FiltrosBeneficios({
  filtros,
  categorias,
  valorInicialBusca,
  aoBuscar,
  aoEscolherCategoria,
}: PropsFiltrosBeneficios) {
  const opcoes = [
    { valor: "", rotulo: "Todas" },
    ...categorias.map((valor) => ({ valor, rotulo: rotulosCategoria[valor].rotulo })),
  ];

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <CampoBusca
        rotulo="Buscar por parceiro ou vantagem"
        placeholder="Buscar por parceiro ou vantagem"
        valorInicial={valorInicialBusca}
        maxLength={TAMANHO_MAXIMO_BUSCA}
        aoBuscar={aoBuscar}
        className="lg:max-w-md lg:flex-1"
      />
      <FiltrosChip
        rotulo="Categorias"
        opcoes={opcoes}
        selecionados={[filtros.categoria]}
        aoMudar={([categoria]) => aoEscolherCategoria(categoria)}
      />
    </div>
  );
}
