"use client";

import { Indicador } from "@/shared/ui";

import { useTotalPessoas } from "../api/pessoas-admin.queries";

export function IndicadorTotalPessoas() {
  const total = useTotalPessoas();

  return (
    <Indicador
      rotulo="Pessoas cadastradas"
      valor={total.data}
      carregando={total.isPending}
      className="w-full sm:max-w-64"
    />
  );
}
