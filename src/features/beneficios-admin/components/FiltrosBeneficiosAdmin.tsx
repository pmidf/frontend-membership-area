"use client";

import type { ChangeEvent } from "react";

import { rotulosCategoria } from "@/features/beneficios/lib/rotulos-beneficio";
import { CATEGORIAS_BENEFICIO } from "@/features/beneficios/tipos/beneficio";
import { CampoBusca, CampoSelecao } from "@/shared/ui";

import { TAMANHO_MAXIMO_BUSCA, type FiltrosTela } from "../lib/filtros-url";
import { rotulosSituacao, rotulosVigencia } from "../lib/rotulos";
import { SITUACOES_BENEFICIO, TIPOS_RESGATE, VIGENCIAS_BENEFICIO } from "../tipos/beneficio-admin";

const opcoesSituacao = SITUACOES_BENEFICIO.map((valor) => ({
  valor,
  rotulo: rotulosSituacao[valor].rotulo,
}));
const opcoesForma = TIPOS_RESGATE.map((valor) => ({
  valor,
  rotulo: valor === "CUPOM" ? "Cupom" : "Instrução",
}));
const opcoesCategoria = CATEGORIAS_BENEFICIO.map((valor) => ({
  valor,
  rotulo: rotulosCategoria[valor].rotulo,
}));
const opcoesVigencia = VIGENCIAS_BENEFICIO.map((valor) => ({
  valor,
  rotulo: rotulosVigencia[valor],
}));

type PropsFiltros = {
  filtros: FiltrosTela;
  valorInicialBusca: string;
  aoBuscar: (termo: string) => void;
  aoFiltrar: (campo: string, valor: string) => void;
};

export function FiltrosBeneficiosAdmin({
  filtros,
  valorInicialBusca,
  aoBuscar,
  aoFiltrar,
}: PropsFiltros) {
  const aoMudar = (campo: string) => (evento: ChangeEvent<HTMLSelectElement>) =>
    aoFiltrar(campo, evento.target.value);

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))] lg:items-end">
      <CampoBusca
        rotulo="Buscar benefício ou parceiro"
        placeholder="Buscar benefício ou parceiro"
        valorInicial={valorInicialBusca}
        maxLength={TAMANHO_MAXIMO_BUSCA}
        aoBuscar={aoBuscar}
        className="sm:col-span-2 lg:col-span-1 lg:mb-1.5"
      />
      <CampoSelecao
        rotulo="Status"
        opcoes={opcoesSituacao}
        textoVazio="Todos"
        value={filtros.situacao}
        onChange={aoMudar("situacao")}
      />
      <CampoSelecao
        rotulo="Forma de resgate"
        opcoes={opcoesForma}
        textoVazio="Todas"
        value={filtros.tipo_resgate}
        onChange={aoMudar("tipo_resgate")}
      />
      <CampoSelecao
        rotulo="Categoria"
        opcoes={opcoesCategoria}
        textoVazio="Todas"
        value={filtros.categoria}
        onChange={aoMudar("categoria")}
      />
      <CampoSelecao
        rotulo="Vigência"
        opcoes={opcoesVigencia}
        textoVazio="Todas"
        value={filtros.vigencia}
        onChange={aoMudar("vigencia")}
      />
    </div>
  );
}
