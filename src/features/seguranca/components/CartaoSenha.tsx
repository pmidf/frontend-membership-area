"use client";

import { KeyRound } from "lucide-react";
import { useState } from "react";

import { Botao, Cartao } from "@/shared/ui";

import { ModalTrocarSenha } from "./ModalTrocarSenha";

export function CartaoSenha() {
  const [aberto, setAberto] = useState(false);

  return (
    <Cartao className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-violeta-50">
          <KeyRound aria-hidden="true" className="size-5 text-texto-marca" />
        </span>
        <div className="flex flex-col gap-1">
          <h3 className="text-corpo font-bold">Senha</h3>
          <p className="text-corpo-pequeno text-texto-secundario">
            Troque sua senha periodicamente. Ao trocar, as outras sessões são encerradas.
          </p>
        </div>
      </div>
      <Botao
        variante="secundario"
        tamanho="sm"
        className="shrink-0"
        onClick={() => setAberto(true)}
      >
        Trocar senha
      </Botao>
      <ModalTrocarSenha aberto={aberto} aoFechar={() => setAberto(false)} />
    </Cartao>
  );
}
