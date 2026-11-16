import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ehErroApi } from "@/shared/api/erro-api";

import type {
  AtualizarOportunidade,
  ConsultaOportunidadesAdmin,
  OportunidadeAdmin,
} from "../tipos/oportunidade-admin";
import {
  atualizarOportunidade,
  criarOportunidade,
  detalharOportunidadeAdmin,
  duplicarOportunidade,
  encerrarOportunidade,
  listarOportunidadesAdmin,
  previewOportunidade,
  publicarOportunidade,
} from "./oportunidades-admin.api";

export const chavesOportunidadesAdmin = {
  todas: ["oportunidades-admin"] as const,
  lista: (consulta: ConsultaOportunidadesAdmin) =>
    ["oportunidades-admin", "lista", consulta] as const,
  detalhe: (id: string) => ["oportunidades-admin", "detalhe", id] as const,
  preview: (id: string) => ["oportunidades-admin", "preview", id] as const,
};

const CHAVE_OPORTUNIDADES_FILIADO = ["oportunidades"] as const;

export function oportunidadeAdminNaoEncontrada(erro: unknown): boolean {
  return ehErroApi(erro) && erro.status === 404;
}

export function conflitoDeSituacao(erro: unknown): boolean {
  return ehErroApi(erro) && erro.status === 409;
}

export function useOportunidadesAdmin(consulta: ConsultaOportunidadesAdmin) {
  return useQuery({
    queryKey: chavesOportunidadesAdmin.lista(consulta),
    queryFn: () => listarOportunidadesAdmin(consulta),
    placeholderData: keepPreviousData,
  });
}

export function useOportunidadeAdmin(id: string) {
  return useQuery({
    queryKey: chavesOportunidadesAdmin.detalhe(id),
    queryFn: () => detalharOportunidadeAdmin(id),
    retry: (falhas, erro) => !oportunidadeAdminNaoEncontrada(erro) && falhas < 1,
  });
}

export function usePreviewOportunidade(id: string) {
  return useQuery({
    queryKey: chavesOportunidadesAdmin.preview(id),
    queryFn: () => previewOportunidade(id),
  });
}

function useInvalidarListas() {
  const clienteConsultas = useQueryClient();
  return () => {
    void clienteConsultas.invalidateQueries({
      queryKey: chavesOportunidadesAdmin.todas,
      predicate: ({ queryKey }) => queryKey[1] !== "detalhe",
    });
    void clienteConsultas.invalidateQueries({ queryKey: CHAVE_OPORTUNIDADES_FILIADO });
  };
}

function useAplicarResposta() {
  const clienteConsultas = useQueryClient();
  const invalidarListas = useInvalidarListas();
  return (oportunidade: OportunidadeAdmin) => {
    clienteConsultas.setQueryData(
      chavesOportunidadesAdmin.detalhe(oportunidade.id_oportunidade),
      oportunidade,
    );
    invalidarListas();
  };
}

function useRecarregarSeConflito() {
  const clienteConsultas = useQueryClient();
  const invalidarListas = useInvalidarListas();
  return (erro: unknown, id: string) => {
    if (!conflitoDeSituacao(erro)) return;
    void clienteConsultas.invalidateQueries({ queryKey: chavesOportunidadesAdmin.detalhe(id) });
    invalidarListas();
  };
}

export function useCriarOportunidade() {
  const aplicarResposta = useAplicarResposta();
  return useMutation({ mutationFn: criarOportunidade, onSuccess: aplicarResposta });
}

export function useAtualizarOportunidade(id: string) {
  const aplicarResposta = useAplicarResposta();
  const recarregarSeConflito = useRecarregarSeConflito();
  return useMutation({
    mutationFn: (dados: AtualizarOportunidade) => atualizarOportunidade(id, dados),
    onSuccess: aplicarResposta,
    onError: (erro) => recarregarSeConflito(erro, id),
  });
}

export function usePublicarOportunidade() {
  const aplicarResposta = useAplicarResposta();
  const recarregarSeConflito = useRecarregarSeConflito();
  return useMutation({
    mutationFn: publicarOportunidade,
    onSuccess: aplicarResposta,
    onError: recarregarSeConflito,
  });
}

export function useEncerrarOportunidade() {
  const aplicarResposta = useAplicarResposta();
  const recarregarSeConflito = useRecarregarSeConflito();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: string; motivo?: string }) =>
      encerrarOportunidade(id, motivo),
    onSuccess: aplicarResposta,
    onError: (erro, { id }) => recarregarSeConflito(erro, id),
  });
}

export function useDuplicarOportunidade() {
  const aplicarResposta = useAplicarResposta();
  return useMutation({ mutationFn: duplicarOportunidade, onSuccess: aplicarResposta });
}
