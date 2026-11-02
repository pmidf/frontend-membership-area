import { useMutation, useQuery } from "@tanstack/react-query";

import { redefinirSenha, solicitarRecuperacao, validarTokenSenha } from "./senha.api";

export const chavesSenha = {
  token: (token: string) => ["senha", "token", token] as const,
};

export function useSolicitarRecuperacao() {
  return useMutation({ mutationFn: solicitarRecuperacao });
}

export function useValidacaoToken(token: string) {
  return useQuery({
    queryKey: chavesSenha.token(token),
    queryFn: () => validarTokenSenha(token),
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
  });
}

export function useRedefinirSenha() {
  return useMutation({ mutationFn: redefinirSenha });
}
