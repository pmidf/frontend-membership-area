"use client";

import { useEffect } from "react";

export function useAvisoAoSair(ativo: boolean) {
  useEffect(() => {
    if (!ativo) return;
    const pedirConfirmacao = (evento: BeforeUnloadEvent) => evento.preventDefault();
    window.addEventListener("beforeunload", pedirConfirmacao);
    return () => window.removeEventListener("beforeunload", pedirConfirmacao);
  }, [ativo]);
}
