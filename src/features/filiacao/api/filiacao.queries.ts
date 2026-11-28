import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { chavesSessao } from "@/shared/sessao/sessao.api";

import {
  atualizarFiliacao,
  buscarMinhaFiliacao,
  confirmarCodigoPmi,
  reenviarCodigoPmi,
  vincularFiliacao,
} from "./filiacao.api";

export const chavesFiliacao = {
  minha: ["filiacao", "minha"] as const,
};

function useRecarregarFiliacao() {
  const clienteConsultas = useQueryClient();
  return () =>
    Promise.all([
      clienteConsultas.invalidateQueries({ queryKey: chavesFiliacao.minha }),
      clienteConsultas.invalidateQueries({ queryKey: chavesSessao.perfil }),
    ]);
}

export function useMinhaFiliacao() {
  return useQuery({ queryKey: chavesFiliacao.minha, queryFn: buscarMinhaFiliacao });
}

export function useVincularFiliacao() {
  const recarregar = useRecarregarFiliacao();
  return useMutation({ mutationFn: vincularFiliacao, onSettled: recarregar });
}

export function useAtualizarFiliacao() {
  const recarregar = useRecarregarFiliacao();
  return useMutation({
    mutationFn: (pmi_id?: string) => atualizarFiliacao(pmi_id),
    onSettled: recarregar,
  });
}

export function useConfirmarCodigoPmi() {
  const recarregar = useRecarregarFiliacao();
  return useMutation({ mutationFn: confirmarCodigoPmi, onSuccess: recarregar });
}

export function useReenviarCodigoPmi() {
  return useMutation({ mutationFn: () => reenviarCodigoPmi() });
}
