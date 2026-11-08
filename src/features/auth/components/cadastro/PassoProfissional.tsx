"use client";

import { useFormContext } from "react-hook-form";

import { CampoTexto } from "@/shared/ui";

import type { DadosCadastro } from "../../schemas/cadastro.schema";

export function PassoProfissional() {
  const {
    register,
    formState: { errors },
  } = useFormContext<DadosCadastro>();

  return (
    <>
      <CampoTexto
        rotulo="Empresa onde trabalha"
        autoComplete="organization"
        erro={errors.empresa?.message}
        {...register("empresa")}
      />
      <CampoTexto
        rotulo="Cargo"
        autoComplete="organization-title"
        erro={errors.cargo?.message}
        {...register("cargo")}
      />
      <CampoTexto
        rotulo="LinkedIn (opcional)"
        type="url"
        inputMode="url"
        placeholder="https://linkedin.com/in/seu-perfil"
        erro={errors.linkedin_url?.message}
        {...register("linkedin_url")}
      />
    </>
  );
}
