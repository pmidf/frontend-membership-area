"use client";

import { DialogoConfirmacao } from "@/shared/ui";

type PropsDialogoEncerrarVaga = {
  titulo: string | null;
  carregando: boolean;
  aoFechar: () => void;
  aoConfirmar: (motivo: string | undefined) => void;
};

export function DialogoEncerrarVaga({
  titulo,
  carregando,
  aoFechar,
  aoConfirmar,
}: PropsDialogoEncerrarVaga) {
  return (
    <DialogoConfirmacao
      aberto={titulo !== null}
      aoFechar={aoFechar}
      aoConfirmar={aoConfirmar}
      titulo="Encerrar vaga?"
      descricao={`“${titulo}” sai do mural dos filiados. Depois de encerrada, ela não pode mais ser editada, só duplicada.`}
      rotuloConfirmar="Encerrar vaga"
      tom="perigo"
      motivo={{ rotulo: "Motivo do encerramento", tamanhoMaximo: 200 }}
      carregando={carregando}
    />
  );
}
