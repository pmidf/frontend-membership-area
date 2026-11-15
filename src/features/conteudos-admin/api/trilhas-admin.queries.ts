import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ehErroApi } from "@/shared/api/erro-api";
import type { SituacaoPublicacao } from "@/shared/publicacao/situacao";

import type { AtualizarTrilha, ConsultaTrilhasAdmin, TrilhaAdmin } from "../tipos/trilha-admin";
import {
  arquivarTrilha,
  atualizarTrilha,
  criarTrilha,
  despublicarTrilha,
  detalharTrilhaAdmin,
  listarTrilhasAdmin,
  publicarTrilha,
} from "./trilhas-admin.api";

export const chavesTrilhasAdmin = {
  todas: ["trilhas-admin"] as const,
  lista: (consulta: ConsultaTrilhasAdmin) => ["trilhas-admin", "lista", consulta] as const,
  total: (situacao: SituacaoPublicacao) => ["trilhas-admin", "total", situacao] as const,
  detalhe: (id: string) => ["trilhas-admin", "detalhe", id] as const,
};

export function trilhaNaoEncontrada(erro: unknown): boolean {
  return ehErroApi(erro) && erro.status === 404;
}

export function useTrilhasAdmin(consulta: ConsultaTrilhasAdmin) {
  return useQuery({
    queryKey: chavesTrilhasAdmin.lista(consulta),
    queryFn: () => listarTrilhasAdmin(consulta),
    placeholderData: keepPreviousData,
  });
}

export function useTotalTrilhas(situacao: SituacaoPublicacao) {
  return useQuery({
    queryKey: chavesTrilhasAdmin.total(situacao),
    queryFn: () => listarTrilhasAdmin({ situacao }),
    select: (pagina) => pagina.total,
  });
}

export function useTrilhaAdmin(id: string) {
  return useQuery({
    queryKey: chavesTrilhasAdmin.detalhe(id),
    queryFn: () => detalharTrilhaAdmin(id),
    retry: (falhas, erro) => !trilhaNaoEncontrada(erro) && falhas < 1,
  });
}

export function useRecarregarTrilha(id: string) {
  const clienteConsultas = useQueryClient();
  return () => {
    void clienteConsultas.invalidateQueries({ queryKey: chavesTrilhasAdmin.detalhe(id) });
  };
}

function useInvalidarListas() {
  const clienteConsultas = useQueryClient();
  return () => {
    void clienteConsultas.invalidateQueries({
      queryKey: chavesTrilhasAdmin.todas,
      predicate: ({ queryKey }) => queryKey[1] !== "detalhe",
    });
    void clienteConsultas.invalidateQueries({ queryKey: ["conteudos"] });
  };
}

function useAplicarResposta() {
  const clienteConsultas = useQueryClient();
  const invalidarListas = useInvalidarListas();
  return (trilha: TrilhaAdmin) => {
    clienteConsultas.setQueryData(chavesTrilhasAdmin.detalhe(trilha.id_trilha), trilha);
    invalidarListas();
  };
}

export function useCriarTrilha() {
  const aplicarResposta = useAplicarResposta();
  return useMutation({ mutationFn: criarTrilha, onSuccess: aplicarResposta });
}

export function useAtualizarTrilha(id: string) {
  const aplicarResposta = useAplicarResposta();
  return useMutation({
    mutationFn: (dados: AtualizarTrilha) => atualizarTrilha(id, dados),
    onSuccess: aplicarResposta,
  });
}

export function usePublicarTrilha() {
  const aplicarResposta = useAplicarResposta();
  return useMutation({ mutationFn: publicarTrilha, onSuccess: aplicarResposta });
}

export function useDespublicarTrilha() {
  const aplicarResposta = useAplicarResposta();
  return useMutation({ mutationFn: despublicarTrilha, onSuccess: aplicarResposta });
}

export function useArquivarTrilha(id: string) {
  const invalidarListas = useInvalidarListas();
  const recarregar = useRecarregarTrilha(id);
  return useMutation({
    mutationFn: () => arquivarTrilha(id),
    onSuccess: () => {
      recarregar();
      invalidarListas();
    },
  });
}
