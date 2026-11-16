"use client";

import { useFormContext, useWatch } from "react-hook-form";

import { LogoEmpresa } from "@/features/oportunidades/components/LogoEmpresa";
import { CampoTexto } from "@/shared/ui";

import { ehEnderecoHttp, type DadosOportunidade } from "../schemas/oportunidade.schema";

export function CampoLogoEmpresa() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<DadosOportunidade>();
  const [logo, empresa] = useWatch({ control, name: ["logo_empresa", "empresa"] });
  const endereco = logo.trim();

  return (
    <div className="flex flex-col gap-3">
      <CampoTexto
        rotulo="URL do logo da empresa"
        type="url"
        inputMode="url"
        placeholder="https://empresa.com/logo.png"
        ajuda="Opcional. Sem logo, mostramos as iniciais da empresa."
        erro={errors.logo_empresa?.message}
        {...register("logo_empresa")}
      />
      <LogoEmpresa
        key={endereco}
        empresa={empresa.trim() || "Empresa"}
        logo={ehEnderecoHttp(endereco) ? endereco : null}
      />
    </div>
  );
}
