"use client";

import { useState } from "react";

import { Botao } from "@/shared/ui";

import { DialogoExcluirConta } from "./DialogoExcluirConta";

export function SecaoExcluirConta() {
  const [confirmando, setConfirmando] = useState(false);

  return (
    <div>
      <Botao
        variante="perigo"
        tamanho="sm"
        className="max-sm:w-full"
        onClick={() => setConfirmando(true)}
      >
        Excluir minha conta
      </Botao>
      {confirmando && <DialogoExcluirConta aoFechar={() => setConfirmando(false)} />}
    </div>
  );
}
