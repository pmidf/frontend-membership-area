"use client";

import { useCatalogoCompleto } from "@/features/conteudos/api/conteudos.queries";
import { CartaoConteudo } from "@/features/conteudos/components/CartaoConteudo";
import { CartaoConteudoBloqueado } from "@/features/conteudos/components/CartaoConteudoBloqueado";
import type { ItemCatalogo } from "@/features/conteudos/tipos/conteudo";
import { EstadoVazio } from "@/shared/ui";

import { conteudosBloqueadosRecentes, conteudosRecentes } from "../lib/selecionar-destaques";
import { LegendaBloqueio } from "./LegendaBloqueio";
import { SecaoInicio } from "./SecaoInicio";
import { ItemTrilho, TrilhoInicio } from "./TrilhoInicio";

type PropsListaConteudos = { itens: ItemCatalogo[]; filiado: boolean; titulo: string };

function ListaConteudos({ itens, filiado, titulo }: PropsListaConteudos) {
  const destaques = filiado ? conteudosRecentes(itens) : conteudosBloqueadosRecentes(itens);

  if (destaques.length === 0) {
    return <EstadoVazio titulo="Novos conteúdos em breve." className="py-6" />;
  }

  return (
    <TrilhoInicio rotulo={titulo} focavel={!filiado}>
      {destaques.map((item) => (
        <ItemTrilho key={item.id_conteudo}>
          {item.bloqueado ? (
            <>
              <CartaoConteudoBloqueado item={item} />
              <LegendaBloqueio>Reprodução liberada para filiados</LegendaBloqueio>
            </>
          ) : (
            <CartaoConteudo item={item} />
          )}
        </ItemTrilho>
      ))}
    </TrilhoInicio>
  );
}

export function ConteudoRecenteInicio({ filiado }: { filiado: boolean }) {
  const catalogo = useCatalogoCompleto();
  const titulo = filiado ? "Conteúdo exclusivo recente" : "Conteúdo exclusivo";

  return (
    <SecaoInicio
      titulo={titulo}
      rotuloLink="Ver todo o conteúdo"
      href="/conteudos"
      consulta={catalogo}
      mensagemErro="Não foi possível carregar os conteúdos."
    >
      {catalogo.data && <ListaConteudos itens={catalogo.data} filiado={filiado} titulo={titulo} />}
    </SecaoInicio>
  );
}
