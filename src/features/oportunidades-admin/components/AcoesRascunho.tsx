"use client";

import { Botao } from "@/shared/ui";

import { ID_FORMULARIO_OPORTUNIDADE } from "./EstruturaFormularioOportunidade";

export type AcaoRascunho = "salvar" | "previsualizar" | "publicar";

type PropsAcoesRascunho = {
  emAndamento: AcaoRascunho | null;
  semAlteracoes?: boolean;
  aoPrevisualizar: () => void;
  aoPublicar: () => void;
};

export function AcoesRascunho({
  emAndamento,
  semAlteracoes = false,
  aoPrevisualizar,
  aoPublicar,
}: PropsAcoesRascunho) {
  const ocupado = emAndamento !== null;

  return (
    <div className="flex flex-col gap-3">
      <Botao
        larguraTotal
        carregando={emAndamento === "publicar"}
        disabled={ocupado && emAndamento !== "publicar"}
        onClick={aoPublicar}
      >
        Publicar vaga
      </Botao>
      <Botao
        variante="secundario"
        larguraTotal
        carregando={emAndamento === "previsualizar"}
        disabled={ocupado && emAndamento !== "previsualizar"}
        onClick={aoPrevisualizar}
      >
        Pré-visualizar
      </Botao>
      <Botao
        type="submit"
        form={ID_FORMULARIO_OPORTUNIDADE}
        variante="link"
        className="self-center"
        carregando={emAndamento === "salvar"}
        disabled={semAlteracoes || (ocupado && emAndamento !== "salvar")}
      >
        Salvar como rascunho
      </Botao>
    </div>
  );
}
