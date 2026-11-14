"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type ValorParametro = string | number | null | undefined;

export function useParametrosUrl() {
  const parametros = useSearchParams();
  const caminho = usePathname();
  const roteador = useRouter();

  const atualizar = useCallback(
    (novos: Record<string, ValorParametro>) => {
      const proximos = new URLSearchParams(parametros.toString());
      Object.entries(novos).forEach(([nome, valor]) => {
        if (valor === null || valor === undefined || valor === "") proximos.delete(nome);
        else proximos.set(nome, String(valor));
      });
      const consulta = proximos.toString();
      roteador.replace(consulta ? `${caminho}?${consulta}` : caminho, { scroll: false });
    },
    [parametros, caminho, roteador],
  );

  return { parametros, atualizar };
}
