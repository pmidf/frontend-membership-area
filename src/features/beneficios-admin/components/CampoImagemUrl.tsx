"use client";

import { useFormContext, useWatch } from "react-hook-form";

import { ImagemBeneficio } from "@/features/beneficios/components/ImagemBeneficio";
import { CampoTexto } from "@/shared/ui";

import { ehImagemValida, type DadosBeneficio } from "../schemas/beneficio.schema";

export function CampoImagemUrl() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<DadosBeneficio>();
  const imagem = useWatch({ control, name: "imagem" }).trim();

  return (
    <div className="flex flex-col gap-3">
      <CampoTexto
        rotulo="URL da imagem"
        type="url"
        inputMode="url"
        placeholder="https://exemplo.com/imagem.jpg"
        ajuda="JPG, PNG ou WebP"
        erro={errors.imagem?.message}
        {...register("imagem")}
      />
      {ehImagemValida(imagem) && (
        <ImagemBeneficio key={imagem} src={imagem} alt="Miniatura da imagem do benefício" />
      )}
    </div>
  );
}
