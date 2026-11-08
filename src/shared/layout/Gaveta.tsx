"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";

type PropsGaveta = {
  aberta: boolean;
  aoFechar: () => void;
  rotulo: string;
  children: ReactNode;
};

export function Gaveta({ aberta, aoFechar, rotulo, children }: PropsGaveta) {
  const dialogoRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo = dialogoRef.current;
    if (!dialogo) return;
    if (aberta && !dialogo.open) dialogo.showModal();
    if (!aberta && dialogo.open) dialogo.close();
  }, [aberta]);

  return (
    <dialog
      ref={dialogoRef}
      aria-label={rotulo}
      onClose={aoFechar}
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) aoFechar();
      }}
      className="m-0 h-dvh max-h-none w-fit max-w-none bg-transparent p-0 backdrop:bg-violeta-950/60"
    >
      <div className="relative h-full">
        {aberta && children}
        <button
          type="button"
          onClick={aoFechar}
          aria-label="Fechar navegação"
          className="absolute top-5 right-3 flex size-9 items-center justify-center rounded-md text-texto-inverso hover:bg-branco/10 focus-visible:outline-2 focus-visible:outline-acao-destaque"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>
    </dialog>
  );
}
