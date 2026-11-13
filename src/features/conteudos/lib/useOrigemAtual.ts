"use client";

import { usePathname, useSearchParams } from "next/navigation";

export function useOrigemAtual(): string {
  const caminho = usePathname();
  const consulta = useSearchParams().toString();
  return consulta ? `${caminho}?${consulta}` : caminho;
}
