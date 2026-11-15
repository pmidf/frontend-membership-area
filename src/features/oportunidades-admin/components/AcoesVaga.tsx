"use client";

import type { ReactNode } from "react";

import { Botao, type PropsBotao } from "@/shared/ui";

import type { AcaoEdicao } from "../lib/acoes-por-situacao";
import { ID_FORMULARIO_OPORTUNIDADE } from "./EstruturaFormularioOportunidade";

type PropsAcoesVaga = {
  acoes: AcaoEdicao[];
  emAndamento: AcaoEdicao | null;
  semAlteracoes?: boolean;
  aoPrevisualizar: () => void;
  aoPublicar: () => void;
  aoEncerrar?: () => void;
  aoDuplicar?: () => void;
};

export function AcoesVaga({
  acoes,
  emAndamento,
  semAlteracoes = false,
  aoPrevisualizar,
  aoPublicar,
  aoEncerrar,
  aoDuplicar,
}: PropsAcoesVaga) {
  const temPublicar = acoes.includes("publicar");
  const unica = acoes.length === 1;

  function propsDe(acao: AcaoEdicao): PropsBotao {
    return {
      larguraTotal: true,
      carregando: emAndamento === acao,
      disabled: emAndamento !== null && emAndamento !== acao,
    };
  }

  const botoes: Record<AcaoEdicao, () => ReactNode> = {
    publicar: () => (
      <Botao key="publicar" {...propsDe("publicar")} onClick={aoPublicar}>
        Publicar vaga
      </Botao>
    ),
    previsualizar: () => (
      <Botao
        key="previsualizar"
        variante="secundario"
        {...propsDe("previsualizar")}
        onClick={aoPrevisualizar}
      >
        Pré-visualizar
      </Botao>
    ),
    salvar: () => {
      const { disabled, ...props } = propsDe("salvar");
      return (
        <Botao
          key="salvar"
          type="submit"
          form={ID_FORMULARIO_OPORTUNIDADE}
          variante={temPublicar ? "link" : "primario"}
          {...props}
          disabled={disabled || semAlteracoes}
        >
          {temPublicar ? "Salvar como rascunho" : "Salvar alterações"}
        </Botao>
      );
    },
    encerrar: () => (
      <Botao key="encerrar" variante="perigoContorno" {...propsDe("encerrar")} onClick={aoEncerrar}>
        Encerrar vaga
      </Botao>
    ),
    duplicar: () => (
      <Botao
        key="duplicar"
        variante={unica ? "primario" : "link"}
        {...propsDe("duplicar")}
        onClick={aoDuplicar}
      >
        {unica ? "Duplicar como rascunho" : "Duplicar"}
      </Botao>
    ),
  };

  return <div className="flex flex-col gap-3">{acoes.map((acao) => botoes[acao]())}</div>;
}
