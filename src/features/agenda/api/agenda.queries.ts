import { useQuery } from "@tanstack/react-query";

import { useSessao } from "@/shared/sessao/useSessao";

import { consultarSituacao, listarEventosAgenda } from "./agenda.api";

export const chavesAgenda = {
  eventos: ["agenda", "eventos"] as const,
  situacao: (eventoIds: string[]) => ["agenda", "situacao", eventoIds] as const,
};

export function useEventosAgenda() {
  return useQuery({ queryKey: chavesAgenda.eventos, queryFn: listarEventosAgenda });
}

export function useSituacaoNosEventos(eventoIds: string[]) {
  const { estado } = useSessao();
  return useQuery({
    queryKey: chavesAgenda.situacao(eventoIds),
    queryFn: () => consultarSituacao(eventoIds),
    enabled: estado === "autenticado" && eventoIds.length > 0,
  });
}
