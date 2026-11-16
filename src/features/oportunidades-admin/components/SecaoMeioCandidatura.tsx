"use client";

import { useFormContext, useWatch } from "react-hook-form";

import type { MeioCandidatura } from "@/features/oportunidades/tipos/oportunidade";
import { Cartao, CampoFormulario, CampoTexto, CartaoOpcao } from "@/shared/ui";

import type { DadosOportunidade } from "../schemas/oportunidade.schema";

const opcoes: { valor: MeioCandidatura; rotulo: string; descricao: string }[] = [
  {
    valor: "LINK",
    rotulo: "Link de candidatura",
    descricao: "A pessoa é levada a uma URL externa.",
  },
  {
    valor: "EMAIL",
    rotulo: "E-mail do recrutador",
    descricao: "Abre o app de e-mail do candidato.",
  },
];

export function SecaoMeioCandidatura({ bloqueado }: { bloqueado: boolean }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<DadosOportunidade>();
  const meio = useWatch({ control, name: "meio_candidatura" });

  return (
    <Cartao className="flex flex-col gap-4 p-6">
      <h2 className="text-h3">Como se candidatar</h2>
      <CampoFormulario
        nome="meio_candidatura"
        controle={control}
        renderizar={({ nome, valor, aoMudar, aoSair, erro }) => (
          <fieldset disabled={bloqueado} className="flex min-w-0 flex-col gap-3">
            <legend className="mb-3 text-corpo-pequeno text-texto-secundario">
              Escolha um único meio de candidatura.
            </legend>
            {opcoes.map((opcao) => (
              <CartaoOpcao
                key={opcao.valor}
                name={nome}
                value={opcao.valor}
                rotulo={opcao.rotulo}
                descricao={opcao.descricao}
                checked={valor === opcao.valor}
                onChange={() => aoMudar(opcao.valor)}
                onBlur={aoSair}
              />
            ))}
            {erro && (
              <p role="alert" className="text-legenda text-texto-erro">
                {erro}
              </p>
            )}
          </fieldset>
        )}
      />
      {meio === "LINK" ? (
        <CampoTexto
          key="url_candidatura"
          rotulo="URL de candidatura"
          type="url"
          inputMode="url"
          placeholder="https://empresa.com/vaga"
          disabled={bloqueado}
          erro={errors.url_candidatura?.message}
          {...register("url_candidatura")}
        />
      ) : (
        <CampoTexto
          key="email_recrutador"
          rotulo="E-mail do recrutador"
          type="email"
          inputMode="email"
          placeholder="recrutamento@empresa.com"
          disabled={bloqueado}
          erro={errors.email_recrutador?.message}
          {...register("email_recrutador")}
        />
      )}
    </Cartao>
  );
}
