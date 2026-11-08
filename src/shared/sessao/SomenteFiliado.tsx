"use client";

import type { ReactNode } from "react";

import { useSessao } from "./useSessao";

type PropsSomenteFiliado = {
  children: ReactNode;
  alternativa?: ReactNode;
};

export function SomenteFiliado({ children, alternativa = null }: PropsSomenteFiliado) {
  const { ehFiliado } = useSessao();
  return <>{ehFiliado ? children : alternativa}</>;
}
