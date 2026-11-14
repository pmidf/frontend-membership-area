import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ehErroApi } from "@/shared/api/erro-api";

import { criarQuebraCabeca, listarQuebraCabecas, publicarQuebraCabeca } from "./quebra-cabecas.api";

export const chavesGamificacaoAdmin = {
  todas: ["gamificacao-admin"] as const,
  lista: ["gamificacao-admin", "lista"] as const,
  detalhe: (id: string) => ["gamificacao-admin", "detalhe", id] as const,
};

export function transicaoInvalida(erro: unknown): boolean {
  return ehErroApi(erro) && erro.status === 409 && erro.codigo === "TRANSICAO_INVALIDA";
}

function useRecarregarLista() {
  const clienteConsultas = useQueryClient();
  return () => clienteConsultas.invalidateQueries({ queryKey: chavesGamificacaoAdmin.lista });
}

export function useQuebraCabecasAdmin() {
  return useQuery({ queryKey: chavesGamificacaoAdmin.lista, queryFn: listarQuebraCabecas });
}

export function useCriarQuebraCabeca() {
  const recarregarLista = useRecarregarLista();
  return useMutation({
    mutationFn: criarQuebraCabeca,
    onSuccess: () => void recarregarLista(),
  });
}

export function usePublicarQuebraCabeca() {
  const recarregarLista = useRecarregarLista();
  return useMutation({
    mutationFn: publicarQuebraCabeca,
    onSettled: () => void recarregarLista(),
  });
}
