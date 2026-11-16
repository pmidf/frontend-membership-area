"use client";

import { PainelExclusivoFiliados } from "@/features/conversao/components/PainelExclusivoFiliados";
import { PreviaBloqueada } from "@/features/conversao/components/PreviaBloqueada";
import { Cartao, EstadoVazio } from "@/shared/ui";

import { textoVagasAbertas } from "../lib/rotulos";
import type { PreviaOportunidades } from "../tipos/oportunidade";
import { FiltrosVagas } from "./FiltrosVagas";
import { LinhaVagaBloqueada } from "./LinhaVagaBloqueada";

export function PreviaVagas({ previa: { total, itens } }: { previa: PreviaOportunidades }) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <FiltrosVagas
          modalidade=""
          valorInicialBusca=""
          desabilitado
          aoBuscar={() => undefined}
          aoFiltrarModalidade={() => undefined}
        />
        <p className="text-legenda text-texto-secundario">Disponível para filiados</p>
      </div>
      <PainelExclusivoFiliados
        descricao="Filie-se ao PMI-DF para ver todas as oportunidades de carreira."
        origem="VITRINE"
        rotuloCta="Quero me filiar"
      />
      {total === 0 ? (
        <EstadoVazio titulo="Novas oportunidades em breve." />
      ) : (
        <Cartao className="flex flex-col gap-4 p-4 md:p-6">
          <h2 className="text-h3">{textoVagasAbertas(total)}</h2>
          <PreviaBloqueada
            itens={itens}
            chave={(_, indice) => String(indice)}
            renderizarItem={({ logo_empresa }) => <LinhaVagaBloqueada logo={logo_empresa} />}
            resumoAcessivel={`${textoVagasAbertas(total)}, exclusivas para filiados`}
            className="flex flex-col gap-3"
          />
        </Cartao>
      )}
    </>
  );
}
