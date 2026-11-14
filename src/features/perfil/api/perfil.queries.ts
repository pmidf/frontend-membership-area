import { useMutation, useQueryClient } from "@tanstack/react-query";

import { chavesSessao } from "@/shared/sessao/sessao.api";

import { atualizarPerfil, excluirConta } from "./perfil.api";

export function useAtualizarPerfil() {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: atualizarPerfil,
    onSuccess: (perfil) => clienteConsultas.setQueryData(chavesSessao.perfil, perfil),
  });
}

export function useExcluirConta() {
  return useMutation({ mutationFn: excluirConta });
}
