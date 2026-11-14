"use client";

import type { ChangeEvent } from "react";

import { TAMANHO_MAXIMO_BUSCA } from "@/features/conteudos/lib/filtros-url";
import { rotulosTipo } from "@/features/conteudos/lib/tipo-conteudo";
import type { CategoriaConteudo, TipoConteudo } from "@/features/conteudos/tipos/conteudo";
import { opcoesSituacao } from "@/shared/publicacao/situacao";
import { CampoBusca, CampoSelecao } from "@/shared/ui";

import type { FiltrosConteudosAdmin as Filtros } from "../lib/filtros-url";

const opcoesTipo = (Object.keys(rotulosTipo) as TipoConteudo[]).map((valor) => ({
  valor,
  rotulo: rotulosTipo[valor],
}));

type PropsFiltros = {
  filtros: Filtros;
  categorias: CategoriaConteudo[];
  valorInicialBusca: string;
  aoBuscar: (termo: string) => void;
  aoFiltrar: (campo: string, valor: string) => void;
};

export function FiltrosConteudosAdmin({
  filtros,
  categorias,
  valorInicialBusca,
  aoBuscar,
  aoFiltrar,
}: PropsFiltros) {
  const aoMudar = (campo: string) => (evento: ChangeEvent<HTMLSelectElement>) =>
    aoFiltrar(campo, evento.target.value);

  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))] lg:items-end">
      <CampoBusca
        rotulo="Buscar conteúdo"
        placeholder="Buscar por título ou descrição"
        valorInicial={valorInicialBusca}
        maxLength={TAMANHO_MAXIMO_BUSCA}
        aoBuscar={aoBuscar}
        className="sm:col-span-3 lg:col-span-1 lg:mb-1.5"
      />
      <CampoSelecao
        rotulo="Status"
        opcoes={opcoesSituacao}
        textoVazio="Todos"
        value={filtros.situacao}
        onChange={aoMudar("situacao")}
      />
      <CampoSelecao
        rotulo="Tipo"
        opcoes={opcoesTipo}
        textoVazio="Todos"
        value={filtros.tipo}
        onChange={aoMudar("tipo")}
      />
      <CampoSelecao
        rotulo="Categoria"
        opcoes={categorias.map(({ cod_categoria, desc_categoria }) => ({
          valor: cod_categoria,
          rotulo: desc_categoria,
        }))}
        textoVazio="Todas"
        value={filtros.categoria}
        onChange={aoMudar("categoria")}
      />
    </div>
  );
}
