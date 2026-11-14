"use client";

import type { ReactNode } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { rotulosCategoria } from "@/features/beneficios/lib/rotulos-beneficio";
import { CATEGORIAS_BENEFICIO } from "@/features/beneficios/tipos/beneficio";
import { CampoAreaTexto, CampoSelecao, CampoTexto, Cartao } from "@/shared/ui";

import { TAMANHO_MAXIMO_LEGENDA, type DadosBeneficio } from "../schemas/beneficio.schema";
import { CampoImagemUrl } from "./CampoImagemUrl";
import { SecaoFormaResgate } from "./SecaoFormaResgate";

const opcoesCategoria = CATEGORIAS_BENEFICIO.map((valor) => ({
  valor,
  rotulo: rotulosCategoria[valor].rotulo,
}));

function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <Cartao className="flex flex-col gap-5 p-6">
      <h2 className="text-h3">{titulo}</h2>
      {children}
    </Cartao>
  );
}

type PropsFormularioBeneficio = {
  parceiro: string;
  formaResgateTravada: boolean;
};

export function FormularioBeneficio({ parceiro, formaResgateTravada }: PropsFormularioBeneficio) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<DadosBeneficio>();
  const legenda = useWatch({ control, name: "legenda" });

  return (
    <>
      <Bloco titulo="Informações básicas">
        <CampoTexto
          rotulo="Título da vantagem"
          erro={errors.titulo?.message}
          {...register("titulo")}
        />
        <CampoTexto
          rotulo="Legenda curta"
          ajuda={`${legenda.length} de ${TAMANHO_MAXIMO_LEGENDA} caracteres. Aparece no card da listagem.`}
          erro={errors.legenda?.message}
          {...register("legenda")}
        />
        <CampoAreaTexto
          rotulo="Descrição completa"
          rows={5}
          erro={errors.descricao?.message}
          {...register("descricao")}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <CampoSelecao
            rotulo="Categoria"
            opcoes={opcoesCategoria}
            erro={errors.categoria?.message}
            {...register("categoria")}
          />
          <CampoTexto rotulo="Parceiro" value={parceiro} readOnly />
        </div>
        <CampoImagemUrl />
      </Bloco>
      <Bloco titulo="Forma de resgate">
        <SecaoFormaResgate travada={formaResgateTravada} />
      </Bloco>
      <Bloco titulo="Vigência">
        <div className="grid gap-5 sm:grid-cols-2">
          <CampoTexto
            rotulo="Início da vigência"
            type="date"
            erro={errors.vigencia_inicio?.message}
            {...register("vigencia_inicio")}
          />
          <CampoTexto
            rotulo="Fim da vigência (opcional)"
            type="date"
            erro={errors.vigencia_fim?.message}
            {...register("vigencia_fim")}
          />
        </div>
      </Bloco>
    </>
  );
}
