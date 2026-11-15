"use client";

import { opcoesUf } from "@/shared/endereco/ufs";
import { CampoBusca, CampoSelecao } from "@/shared/ui";

import { TAMANHO_MAXIMO_TEXTO } from "../lib/filtros-url";

type PropsFiltrosProfissionais = {
  uf: string;
  valorInicialBusca: string;
  valorInicialCidade: string;
  aoBuscar: (termo: string) => void;
  aoFiltrarUf: (uf: string) => void;
  aoFiltrarCidade: (cidade: string) => void;
};

export function FiltrosProfissionais({
  uf,
  valorInicialBusca,
  valorInicialCidade,
  aoBuscar,
  aoFiltrarUf,
  aoFiltrarCidade,
}: PropsFiltrosProfissionais) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
      <CampoBusca
        rotulo="Buscar por nome, cargo ou empresa"
        placeholder="Buscar por nome, cargo ou empresa"
        valorInicial={valorInicialBusca}
        maxLength={TAMANHO_MAXIMO_TEXTO}
        aoBuscar={aoBuscar}
        className="lg:flex-1"
      />
      <CampoSelecao
        rotulo="UF"
        opcoes={[{ valor: "", rotulo: "Todas as UFs" }, ...opcoesUf]}
        value={uf}
        onChange={(evento) => aoFiltrarUf(evento.target.value)}
        className="lg:w-40"
      />
      <CampoBusca
        rotulo="Cidade"
        placeholder="Cidade (nome completo)"
        valorInicial={valorInicialCidade}
        maxLength={TAMANHO_MAXIMO_TEXTO}
        aoBuscar={aoFiltrarCidade}
        className="lg:w-64"
      />
    </div>
  );
}
