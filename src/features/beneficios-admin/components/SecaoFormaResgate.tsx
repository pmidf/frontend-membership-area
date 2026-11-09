"use client";

import { useFormContext, useWatch } from "react-hook-form";

import { CampoAreaTexto, CampoFormulario, CampoTexto, CartaoOpcao } from "@/shared/ui";

import type { DadosBeneficio } from "../schemas/beneficio.schema";

const opcoes = [
  {
    valor: "CUPOM",
    rotulo: "Cupom compartilhado",
    descricao: "Um único código serve para todos os filiados.",
  },
  {
    valor: "INSTRUCAO",
    rotulo: "Instrução por texto",
    descricao: "Sem código. O filiado recebe o passo a passo.",
  },
] as const;

export function SecaoFormaResgate({ travada }: { travada: boolean }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<DadosBeneficio>();
  const tipo = useWatch({ control, name: "tipo_resgate" });

  return (
    <div className="flex flex-col gap-4">
      <CampoFormulario
        nome="tipo_resgate"
        controle={control}
        renderizar={({ nome, valor, aoMudar, aoSair, erro }) => (
          <fieldset className="flex min-w-0 flex-col gap-3">
            <legend className="sr-only">Forma de resgate</legend>
            {opcoes.map((opcao) => (
              <CartaoOpcao
                key={opcao.valor}
                name={nome}
                value={opcao.valor}
                rotulo={opcao.rotulo}
                descricao={opcao.descricao}
                checked={valor === opcao.valor}
                disabled={travada}
                onChange={() => aoMudar(opcao.valor)}
                onBlur={aoSair}
              />
            ))}
            {travada && (
              <p className="text-legenda text-texto-secundario">
                Já houve resgates: a forma de resgate não pode mais mudar.
              </p>
            )}
            {erro && (
              <p role="alert" className="text-legenda text-texto-erro">
                {erro}
              </p>
            )}
          </fieldset>
        )}
      />
      {tipo === "CUPOM" ? (
        <CampoTexto
          rotulo="Código do cupom"
          erro={errors.cod_cupom?.message}
          {...register("cod_cupom")}
        />
      ) : (
        <CampoAreaTexto
          rotulo="Instrução de resgate"
          ajuda="Parágrafos e listas simples."
          rows={5}
          erro={errors.desc_instrucao?.message}
          {...register("desc_instrucao")}
        />
      )}
    </div>
  );
}
