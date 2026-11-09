import { useQuery } from "@tanstack/react-query";

import { useSessao } from "@/shared/sessao/useSessao";

import { listarMeusResgates } from "./resgates.api";

export const chavesResgates = {
  meus: ["resgates", "meus"] as const,
};

export function useMeusResgates() {
  const { estado } = useSessao();
  return useQuery({
    queryKey: chavesResgates.meus,
    queryFn: listarMeusResgates,
    enabled: estado === "autenticado",
  });
}
