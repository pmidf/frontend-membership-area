"use client";

import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";

import { CampoAreaTexto, CampoTexto, Cartao } from "@/shared/ui";

import type { DadosOportunidade } from "../schemas/oportunidade.schema";
import { CampoLogoEmpresa } from "./CampoLogoEmpresa";
import { CampoModalidade } from "./CampoModalidade";

function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <Cartao className="flex flex-col gap-5 p-6">
      <h2 className="text-h3">{titulo}</h2>
      {children}
    </Cartao>
  );
}

export function FormularioOportunidade() {
  const {
    register,
    formState: { errors },
  } = useFormContext<DadosOportunidade>();

  return (
    <>
      <Bloco titulo="Informações da vaga">
        <CampoTexto
          rotulo="Título da vaga"
          placeholder="Ex.: Gerente de Projetos Sênior"
          maxLength={150}
          erro={errors.titulo?.message}
          {...register("titulo")}
        />
        <CampoTexto
          rotulo="Empresa"
          placeholder="Ex.: Construtora Vega"
          maxLength={150}
          erro={errors.empresa?.message}
          {...register("empresa")}
        />
        <CampoAreaTexto
          rotulo="Descrição"
          rows={6}
          placeholder="Descreva responsabilidades, requisitos e o que a empresa oferece."
          ajuda="Deixe uma linha em branco entre parágrafos e comece com “- ” as linhas de uma lista. O texto é sanitizado automaticamente."
          erro={errors.descricao?.message}
          {...register("descricao")}
        />
      </Bloco>
      <Bloco titulo="Informações opcionais">
        <CampoTexto
          rotulo="Localidade"
          placeholder="Ex.: Brasília/DF"
          maxLength={100}
          erro={errors.localidade?.message}
          {...register("localidade")}
        />
        <CampoModalidade />
        <CampoTexto
          rotulo="Data de encerramento"
          type="date"
          ajuda="Se não informada, a vaga fica aberta por 60 dias a partir da publicação."
          erro={errors.data_encerramento?.message}
          className="sm:max-w-xs"
          {...register("data_encerramento")}
        />
        <CampoLogoEmpresa />
      </Bloco>
    </>
  );
}
