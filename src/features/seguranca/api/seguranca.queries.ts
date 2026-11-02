import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { encerrarOutrasSessoes, encerrarSessao, listarSessoes, trocarSenha } from "./seguranca.api";

export const chavesSeguranca = {
  sessoes: ["seguranca", "sessoes"] as const,
};

function useAtualizarSessoes() {
  const clienteConsultas = useQueryClient();
  return () => clienteConsultas.invalidateQueries({ queryKey: chavesSeguranca.sessoes });
}

export function useSessoes() {
  return useQuery({ queryKey: chavesSeguranca.sessoes, queryFn: listarSessoes });
}

export function useEncerrarSessao() {
  const atualizar = useAtualizarSessoes();
  return useMutation({ mutationFn: encerrarSessao, onSettled: atualizar });
}

export function useEncerrarOutrasSessoes() {
  const atualizar = useAtualizarSessoes();
  return useMutation({ mutationFn: encerrarOutrasSessoes, onSuccess: atualizar });
}

export function useTrocarSenha() {
  const atualizar = useAtualizarSessoes();
  return useMutation({ mutationFn: trocarSenha, onSuccess: atualizar });
}
