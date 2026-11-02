"use client";

import { useCallback, useEffect, useState } from "react";

export function formatarDuracao(segundos: number): string {
  const minutos = Math.floor(segundos / 60);
  return `${minutos}:${String(segundos % 60).padStart(2, "0")}`;
}

export function useContagemRegressiva(segundosIniciais = 0) {
  const [restantes, setRestantes] = useState(Math.max(0, Math.ceil(segundosIniciais)));

  useEffect(() => {
    if (restantes <= 0) return;
    const temporizador = setTimeout(() => setRestantes((atual) => atual - 1), 1000);
    return () => clearTimeout(temporizador);
  }, [restantes]);

  const reiniciar = useCallback((segundos: number) => {
    setRestantes(Math.max(0, Math.ceil(segundos)));
  }, []);

  return { restantes, ativa: restantes > 0, rotulo: formatarDuracao(restantes), reiniciar };
}
