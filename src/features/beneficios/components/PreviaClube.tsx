"use client";

import { PainelExclusivoFiliados } from "@/features/conversao/components/PainelExclusivoFiliados";
import { PreviaBloqueada } from "@/features/conversao/components/PreviaBloqueada";
import { CampoBusca, EstadoVazio, FiltrosChip } from "@/shared/ui";

import { rotulosCategoria } from "../lib/rotulos-beneficio";
import { CATEGORIAS_BENEFICIO, type PreviaBeneficios } from "../tipos/beneficio";
import { CartaoBeneficioBloqueado } from "./CartaoBeneficioBloqueado";

const opcoesCategoria = [
  { valor: "", rotulo: "Todas" },
  ...CATEGORIAS_BENEFICIO.map((valor) => ({ valor, rotulo: rotulosCategoria[valor].rotulo })),
];

export function PreviaClube({ previa: { total, itens } }: { previa: PreviaBeneficios }) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <CampoBusca
            rotulo="Buscar por parceiro ou vantagem"
            placeholder="Buscar por parceiro ou vantagem"
            desabilitado
            aoBuscar={() => undefined}
            className="lg:max-w-md lg:flex-1"
          />
          <FiltrosChip
            rotulo="Categorias"
            opcoes={opcoesCategoria}
            selecionados={[""]}
            desabilitado
            aoMudar={() => undefined}
          />
        </div>
        <p className="text-legenda text-texto-secundario">Disponível para filiados</p>
      </div>
      <PainelExclusivoFiliados
        descricao="Filie-se ao PMI-DF para ter acesso ao clube de benefícios."
        origem="BENEFICIOS"
      />
      {total === 0 ? (
        <EstadoVazio titulo="Novos benefícios em breve." />
      ) : (
        <PreviaBloqueada
          itens={itens}
          chave={(_, indice) => String(indice)}
          renderizarItem={({ imagem }) => <CartaoBeneficioBloqueado imagem={imagem} />}
          resumoAcessivel={`${total} benefícios disponíveis para filiados`}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        />
      )}
    </>
  );
}
