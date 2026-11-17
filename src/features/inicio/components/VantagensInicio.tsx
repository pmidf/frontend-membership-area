"use client";

import { Gift } from "lucide-react";

import { useBeneficios } from "@/features/beneficios/api/beneficios.queries";
import { CartaoBeneficio } from "@/features/beneficios/components/CartaoBeneficio";
import { CartaoBeneficioBloqueado } from "@/features/beneficios/components/CartaoBeneficioBloqueado";
import { ehPrevia } from "@/features/beneficios/lib/eh-previa";
import type { RespostaBeneficios } from "@/features/beneficios/tipos/beneficio";
import { EstadoVazio } from "@/shared/ui";

import { DESTAQUES_POR_SECAO } from "../lib/selecionar-destaques";
import { LegendaBloqueio } from "./LegendaBloqueio";
import { SecaoInicio } from "./SecaoInicio";
import { ItemTrilho, TrilhoInicio } from "./TrilhoInicio";

function ListaVantagens({ resposta, titulo }: { resposta: RespostaBeneficios; titulo: string }) {
  if (resposta.itens.length === 0) {
    return <EstadoVazio icone={Gift} titulo="Novos benefícios em breve." className="py-6" />;
  }

  if (ehPrevia(resposta)) {
    return (
      <>
        <p className="sr-only">{`${resposta.total} benefícios disponíveis para filiados`}</p>
        <TrilhoInicio rotulo={titulo} focavel>
          {resposta.itens.slice(0, DESTAQUES_POR_SECAO).map(({ imagem }, indice) => (
            <ItemTrilho key={indice}>
              <div
                inert
                aria-hidden="true"
                data-bloqueado="true"
                className="pointer-events-none blur-sm select-none"
              >
                <CartaoBeneficioBloqueado imagem={imagem} />
              </div>
              <LegendaBloqueio>Código de resgate visível para filiados</LegendaBloqueio>
            </ItemTrilho>
          ))}
        </TrilhoInicio>
      </>
    );
  }

  return (
    <TrilhoInicio rotulo={titulo}>
      {resposta.itens.slice(0, DESTAQUES_POR_SECAO).map((beneficio) => (
        <ItemTrilho key={beneficio.id_beneficio}>
          <CartaoBeneficio
            beneficio={beneficio}
            href={`/beneficios/${encodeURIComponent(beneficio.id_beneficio)}`}
          />
        </ItemTrilho>
      ))}
    </TrilhoInicio>
  );
}

export function VantagensInicio({ filiado }: { filiado: boolean }) {
  const beneficios = useBeneficios();
  const titulo = filiado ? "Vantagens do momento" : "Vantagens que a filiação libera";

  return (
    <SecaoInicio
      titulo={titulo}
      rotuloLink={filiado ? "Ver clube de benefícios" : "Ver tudo o que está bloqueado"}
      href="/beneficios"
      consulta={beneficios}
      mensagemErro="Não foi possível carregar os benefícios."
    >
      {beneficios.data && <ListaVantagens resposta={beneficios.data} titulo={titulo} />}
    </SecaoInicio>
  );
}
