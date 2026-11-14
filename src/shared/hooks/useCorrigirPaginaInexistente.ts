import { useEffect } from "react";

export function useCorrigirPaginaInexistente(
  paginaInexistente: boolean,
  ultimaPagina: number,
  atualizar: (novos: { pagina: number | null }) => void,
): void {
  useEffect(() => {
    if (paginaInexistente) atualizar({ pagina: ultimaPagina > 1 ? ultimaPagina : null });
  }, [paginaInexistente, ultimaPagina, atualizar]);
}
