import { useQuery } from "@tanstack/react-query";

import { verificarApiDisponivel } from "./saude.api";

export const chavesSaude = {
  api: ["saude", "api"] as const,
};

export function useApiDisponivel() {
  return useQuery({
    queryKey: chavesSaude.api,
    queryFn: verificarApiDisponivel,
    retry: false,
  });
}
