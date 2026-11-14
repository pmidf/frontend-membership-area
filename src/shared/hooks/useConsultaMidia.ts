"use client";

import { useCallback, useSyncExternalStore } from "react";

export function useConsultaMidia(consulta: string): boolean {
  const assinar = useCallback(
    (aoMudar: () => void) => {
      const lista = window.matchMedia(consulta);
      lista.addEventListener("change", aoMudar);
      return () => lista.removeEventListener("change", aoMudar);
    },
    [consulta],
  );

  return useSyncExternalStore(
    assinar,
    () => window.matchMedia(consulta).matches,
    () => false,
  );
}

export const TELA_PEQUENA = "(max-width: 767px)";
