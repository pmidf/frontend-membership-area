import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { chavesProfissionais } from "@/features/profissionais/api/profissionais.queries";
import { chavesSessao } from "@/shared/sessao/sessao.api";

import {
  atualizarPreferencias,
  obterPreferencias,
  type AtualizarPreferencias,
  type Preferencias,
} from "./preferencias.api";

export const chavesPreferencias = {
  minhas: ["perfil", "preferencias"] as const,
};

export function usePreferencias() {
  return useQuery({ queryKey: chavesPreferencias.minhas, queryFn: obterPreferencias });
}

export function useAtualizarPreferencias() {
  const clienteConsultas = useQueryClient();

  return useMutation({
    mutationFn: atualizarPreferencias,
    onMutate: async (alteracao: AtualizarPreferencias) => {
      await clienteConsultas.cancelQueries({ queryKey: chavesPreferencias.minhas });
      const anteriores = clienteConsultas.getQueryData<Preferencias>(chavesPreferencias.minhas);
      if (anteriores) {
        clienteConsultas.setQueryData<Preferencias>(chavesPreferencias.minhas, {
          ...anteriores,
          ...alteracao,
        });
      }
      return { anteriores };
    },
    onError: (_erro, _alteracao, contexto) => {
      if (contexto?.anteriores) {
        clienteConsultas.setQueryData(chavesPreferencias.minhas, contexto.anteriores);
      }
    },
    onSuccess: async (preferencias, alteracao) => {
      clienteConsultas.setQueryData(chavesPreferencias.minhas, preferencias);
      if (alteracao.exibir_vitrine === undefined) return;
      await Promise.all([
        clienteConsultas.invalidateQueries({ queryKey: chavesSessao.perfil }),
        clienteConsultas.invalidateQueries({ queryKey: chavesProfissionais.todas }),
      ]);
    },
  });
}
