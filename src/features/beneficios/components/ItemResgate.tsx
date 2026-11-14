"use client";

import { useState } from "react";

import { formatarData } from "@/shared/lib/datas";
import { Botao, Etiqueta } from "@/shared/ui";

import type { ItemHistoricoResgate } from "../api/resgates.api";
import { ModalInstrucaoResgate } from "./ModalInstrucaoResgate";

export function ItemResgate({ resgate }: { resgate: ItemHistoricoResgate }) {
  const [vendoInstrucoes, setVendoInstrucoes] = useState(false);
  const { titulo, parceiro, data_resgate, beneficio_encerrado, tipo_resgate, conteudo_entregue } =
    resgate;

  return (
    <li className="flex flex-col gap-2 rounded-md bg-neutro-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="flex flex-wrap items-center gap-2 text-corpo-pequeno font-medium">
          {titulo}
          {beneficio_encerrado && <Etiqueta tom="neutro">Encerrado</Etiqueta>}
        </p>
        <p className="text-legenda text-texto-secundario">
          {parceiro} · resgatado em {formatarData(data_resgate)}
        </p>
      </div>
      {conteudo_entregue !== undefined && tipo_resgate === "CUPOM" && (
        <p className="text-corpo-pequeno font-medium break-all text-texto-marca select-all">
          {conteudo_entregue}
        </p>
      )}
      {conteudo_entregue !== undefined && tipo_resgate === "INSTRUCAO" && (
        <Botao
          variante="link"
          tamanho="sm"
          className="self-start sm:self-auto"
          aria-label={`Ver instruções de ${titulo}`}
          onClick={() => setVendoInstrucoes(true)}
        >
          Ver instruções
        </Botao>
      )}
      {vendoInstrucoes && conteudo_entregue !== undefined && (
        <ModalInstrucaoResgate
          conteudo={conteudo_entregue}
          aoFechar={() => setVendoInstrucoes(false)}
        />
      )}
    </li>
  );
}
