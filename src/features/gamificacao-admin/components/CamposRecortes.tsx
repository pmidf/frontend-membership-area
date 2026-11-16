"use client";

import { useFormContext, useWatch } from "react-hook-form";

import { Alerta, CampoTexto } from "@/shared/ui";

import { TOTAL_RECORTES, type DadosQuebraCabeca } from "../schemas/quebra-cabeca.schema";
import { GradeRecortes } from "./GradeRecortes";

export function CamposRecortes() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<DadosQuebraCabeca>();
  const recortes = useWatch({ control, name: "recortes" });
  const erroDoGrupo = errors.recortes?.message ?? errors.recortes?.root?.message;
  const algumaPecaComErro =
    Array.isArray(errors.recortes) && errors.recortes.some((erro) => erro !== undefined);

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-1 text-rotulo text-texto-secundario">
        URLs das {TOTAL_RECORTES} peças, na ordem da grade (1 a 4 em cima, 5 a 8 embaixo)
      </legend>
      {(erroDoGrupo || algumaPecaComErro) && (
        <Alerta tom="erro">
          {erroDoGrupo ?? `Confira as ${TOTAL_RECORTES} peças destacadas.`}
        </Alerta>
      )}
      <div className="flex flex-col gap-5">
        <GradeRecortes recortes={recortes} className="w-full max-w-80" />
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: TOTAL_RECORTES }, (_, indice) => (
            <CampoTexto
              key={indice}
              rotulo={`URL da peça ${indice + 1}`}
              type="url"
              inputMode="url"
              placeholder="https://…/peca.png"
              erro={errors.recortes?.[indice]?.message}
              {...register(`recortes.${indice}`)}
            />
          ))}
        </div>
      </div>
    </fieldset>
  );
}
