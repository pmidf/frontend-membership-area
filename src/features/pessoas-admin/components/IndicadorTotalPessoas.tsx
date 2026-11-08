"use client";

import { Cartao, Esqueleto } from "@/shared/ui";

import { useTotalPessoas } from "../api/pessoas-admin.queries";

export function IndicadorTotalPessoas() {
  const total = useTotalPessoas();

  return (
    <Cartao className="flex w-full flex-col gap-1 p-5 sm:max-w-64">
      {total.isPending ? (
        <Esqueleto variante="linha" rotulo="Carregando o total de pessoas…" />
      ) : (
        <p className="text-h2 text-texto-marca">{total.data ?? "—"}</p>
      )}
      <p className="text-corpo-pequeno text-texto-secundario">Pessoas cadastradas</p>
    </Cartao>
  );
}
