import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ehErroApi } from "@/shared/api/erro-api";

import type { PeriodoAdmin } from "../periodo";
import { revalidarAgendaPublica } from "../revalidar-agenda";
import {
  atualizarAgenda,
  desfazerResolucao,
  exportarNumeros,
  exportarParticipantes,
  listarEventosComNumeros,
  marcarNaoMembros,
  obterConciliacao,
  obterParticipantesDoEvento,
  vincularParticipacao,
  type FiltrosExportacaoParticipantes,
} from "./agenda-admin.api";

export const chavesAgendaAdmin = {
  todas: ["agenda-admin"] as const,
  eventos: (periodo: PeriodoAdmin) => ["agenda-admin", "eventos", periodo] as const,
  participantes: (id: string) => ["agenda-admin", "participantes", id] as const,
  conciliacao: (periodo: PeriodoAdmin) => ["agenda-admin", "conciliacao", periodo] as const,
};

export function eventoNaoEncontrado(erro: unknown): boolean {
  return ehErroApi(erro) && erro.status === 404;
}

const erroDoCliente = (erro: unknown) => ehErroApi(erro) && erro.status >= 400 && erro.status < 500;
const tentarDeNovo = (falhas: number, erro: unknown) => !erroDoCliente(erro) && falhas < 1;

export function useEventosComNumeros(periodo: PeriodoAdmin) {
  return useQuery({
    queryKey: chavesAgendaAdmin.eventos(periodo),
    queryFn: () => listarEventosComNumeros(periodo),
    retry: tentarDeNovo,
  });
}

export function useParticipantesDoEvento(id: string) {
  return useQuery({
    queryKey: chavesAgendaAdmin.participantes(id),
    queryFn: () => obterParticipantesDoEvento(id),
    retry: tentarDeNovo,
  });
}

export function useConciliacao(periodo: PeriodoAdmin) {
  return useQuery({
    queryKey: chavesAgendaAdmin.conciliacao(periodo),
    queryFn: () => obterConciliacao(periodo),
    retry: tentarDeNovo,
  });
}

function useInvalidarAgendaAdmin() {
  const clienteConsultas = useQueryClient();
  return () => clienteConsultas.invalidateQueries({ queryKey: chavesAgendaAdmin.todas });
}

export function useAtualizarAgenda() {
  const invalidar = useInvalidarAgendaAdmin();
  return useMutation({
    mutationFn: async () => {
      await atualizarAgenda();
      await revalidarAgendaPublica().catch(() => undefined);
    },
    onSuccess: invalidar,
  });
}

export function useVincularParticipacao() {
  const invalidar = useInvalidarAgendaAdmin();
  return useMutation({ mutationFn: vincularParticipacao, onSuccess: invalidar });
}

export function useMarcarNaoMembros() {
  const invalidar = useInvalidarAgendaAdmin();
  return useMutation({ mutationFn: marcarNaoMembros, onSuccess: invalidar });
}

export function useDesfazerResolucao() {
  const invalidar = useInvalidarAgendaAdmin();
  return useMutation({ mutationFn: desfazerResolucao, onSuccess: invalidar });
}

export function useExportarNumeros() {
  return useMutation({ mutationFn: exportarNumeros });
}

export function useExportarParticipantes(id: string) {
  return useMutation({
    mutationFn: (filtros: FiltrosExportacaoParticipantes) => exportarParticipantes(id, filtros),
  });
}
