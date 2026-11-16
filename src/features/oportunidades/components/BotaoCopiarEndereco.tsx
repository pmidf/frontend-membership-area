"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Botao } from "@/shared/ui";

const DURACAO_CONFIRMACAO = 3000;

export function BotaoCopiarEndereco({ endereco }: { endereco: string }) {
  const [situacao, setSituacao] = useState<"ociosa" | "copiado" | "falhou">("ociosa");
  const temporizador = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(temporizador.current), []);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(endereco);
      setSituacao("copiado");
      clearTimeout(temporizador.current);
      temporizador.current = setTimeout(() => setSituacao("ociosa"), DURACAO_CONFIRMACAO);
    } catch {
      setSituacao("falhou");
    }
  }

  const copiado = situacao === "copiado";
  const Icone = copiado ? Check : Copy;

  return (
    <div className="flex flex-col gap-2">
      <Botao
        variante="secundario"
        larguraTotal
        onClick={() => void copiar()}
        icone={<Icone aria-hidden="true" className="size-4" />}
      >
        {copiado ? "Endereço copiado" : "Copiar endereço"}
      </Botao>
      <span aria-live="polite" className="sr-only">
        {copiado ? "Endereço copiado para a área de transferência" : ""}
      </span>
      {situacao === "falhou" && (
        <p role="alert" className="text-corpo-pequeno text-texto-erro">
          Não foi possível copiar. Selecione o endereço e copie manualmente.
        </p>
      )}
    </div>
  );
}
