"use client";

import type { ReactNode } from "react";

import { Botao } from "@/shared/ui";

export type AcaoPublicacao = "salvar" | "publicar" | "despublicar" | "arquivar";

type PropsAcoesPublicacao<A extends string> = {
  idFormulario: string;
  acoes: readonly (AcaoPublicacao | A)[];
  rotuloPublicar: string;
  rotuloSalvar?: string;
  semAlteracoes?: boolean;
  salvando: boolean;
  publicando: boolean;
  aoPublicar: () => void;
  aoDespublicar?: () => void;
  aoArquivar?: () => void;
  somenteLeitura?: ReactNode;
};

export function AcoesPublicacao<A extends string>({
  idFormulario,
  acoes,
  rotuloPublicar,
  rotuloSalvar = "Salvar alterações",
  semAlteracoes = false,
  salvando,
  publicando,
  aoPublicar,
  aoDespublicar,
  aoArquivar,
  somenteLeitura,
}: PropsAcoesPublicacao<A>) {
  if (!acoes.includes("salvar")) return somenteLeitura;

  const ocupado = salvando || publicando;
  const podePublicar = acoes.includes("publicar");

  return (
    <div className="flex flex-col gap-3">
      {podePublicar && (
        <Botao larguraTotal carregando={publicando} disabled={salvando} onClick={aoPublicar}>
          {rotuloPublicar}
        </Botao>
      )}
      <Botao
        type="submit"
        form={idFormulario}
        larguraTotal
        variante={podePublicar ? "secundario" : "primario"}
        disabled={semAlteracoes || publicando}
        carregando={salvando}
      >
        {rotuloSalvar}
      </Botao>
      {acoes.includes("despublicar") && (
        <Botao variante="secundario" larguraTotal disabled={ocupado} onClick={aoDespublicar}>
          Despublicar
        </Botao>
      )}
      {acoes.includes("arquivar") && (
        <Botao variante="perigoContorno" larguraTotal disabled={ocupado} onClick={aoArquivar}>
          Arquivar
        </Botao>
      )}
    </div>
  );
}
