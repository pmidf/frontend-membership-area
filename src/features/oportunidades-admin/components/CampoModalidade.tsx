"use client";

import { useFormContext } from "react-hook-form";

import { rotulosModalidade } from "@/features/oportunidades/lib/rotulos";
import type { Modalidade } from "@/features/oportunidades/tipos/oportunidade";
import { CampoFormulario, CartaoOpcao } from "@/shared/ui";

import type { DadosOportunidade } from "../schemas/oportunidade.schema";

const opcoes: { valor: Modalidade; descricao: string }[] = [
  { valor: "HIBRIDO", descricao: "Combina dias presenciais e remotos." },
  { valor: "REMOTO", descricao: "Trabalho 100% à distância." },
  { valor: "PRESENCIAL", descricao: "Comparecimento no local da empresa." },
];

export function CampoModalidade() {
  const { control } = useFormContext<DadosOportunidade>();

  return (
    <CampoFormulario
      nome="modalidade"
      controle={control}
      renderizar={({ nome, valor, aoMudar, aoSair, erro }) => (
        <fieldset className="flex min-w-0 flex-col gap-2">
          <legend className="mb-2 text-rotulo text-texto-primario">Modalidade</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {opcoes.map((opcao) => (
              <CartaoOpcao
                key={opcao.valor}
                name={nome}
                value={opcao.valor}
                rotulo={rotulosModalidade[opcao.valor].rotulo}
                descricao={opcao.descricao}
                checked={valor === opcao.valor}
                onChange={() => aoMudar(opcao.valor)}
                onBlur={aoSair}
              />
            ))}
          </div>
          {valor !== "" && (
            <button
              type="button"
              onClick={() => aoMudar("")}
              className="self-start text-legenda font-medium text-texto-marca underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-acao-destaque"
            >
              Não informar a modalidade
            </button>
          )}
          {erro && (
            <p role="alert" className="text-legenda text-texto-erro">
              {erro}
            </p>
          )}
        </fieldset>
      )}
    />
  );
}
