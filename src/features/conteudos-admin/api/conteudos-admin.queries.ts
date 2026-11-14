import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ehErroApi } from "@/shared/api/erro-api";
import type { SituacaoPublicacao } from "@/shared/publicacao/situacao";

import type {
  AtualizarConteudo,
  ConsultaConteudosAdmin,
  ConteudoAdmin,
} from "../tipos/conteudo-admin";
import {
  arquivarConteudo,
  atualizarConteudo,
  criarConteudo,
  detalharConteudoAdmin,
  listarConteudosAdmin,
  previaYoutube,
  publicarConteudo,
} from "./conteudos-admin.api";

export const chavesConteudosAdmin = {
  todas: ["conteudos-admin"] as const,
  lista: (consulta: ConsultaConteudosAdmin) => ["conteudos-admin", "lista", consulta] as const,
  total: (situacao: SituacaoPublicacao) => ["conteudos-admin", "total", situacao] as const,
  detalhe: (id: string) => ["conteudos-admin", "detalhe", id] as const,
  previa: (url: string) => ["conteudos-admin", "previa", url] as const,
};

export function conteudoAdminNaoEncontrado(erro: unknown): boolean {
  return ehErroApi(erro) && erro.status === 404;
}

export function conflitoDeSituacao(erro: unknown): boolean {
  return ehErroApi(erro) && erro.status === 409;
}

export function useConteudosAdmin(consulta: ConsultaConteudosAdmin) {
  return useQuery({
    queryKey: chavesConteudosAdmin.lista(consulta),
    queryFn: () => listarConteudosAdmin(consulta),
    placeholderData: keepPreviousData,
  });
}

export function useTotalConteudos(situacao: SituacaoPublicacao) {
  return useQuery({
    queryKey: chavesConteudosAdmin.total(situacao),
    queryFn: () => listarConteudosAdmin({ situacao }),
    select: (pagina) => pagina.total,
  });
}

export function useConteudoAdmin(id: string) {
  return useQuery({
    queryKey: chavesConteudosAdmin.detalhe(id),
    queryFn: () => detalharConteudoAdmin(id),
    retry: (falhas, erro) => !conteudoAdminNaoEncontrado(erro) && falhas < 1,
  });
}

export function useRecarregarConteudo(id: string) {
  const clienteConsultas = useQueryClient();
  return () => {
    void clienteConsultas.invalidateQueries({ queryKey: chavesConteudosAdmin.detalhe(id) });
  };
}

function useInvalidarListas() {
  const clienteConsultas = useQueryClient();
  return () => {
    void clienteConsultas.invalidateQueries({
      queryKey: chavesConteudosAdmin.todas,
      predicate: ({ queryKey }) => queryKey[1] !== "detalhe",
    });
    void clienteConsultas.invalidateQueries({ queryKey: ["conteudos"] });
  };
}

function useAplicarResposta() {
  const clienteConsultas = useQueryClient();
  const invalidarListas = useInvalidarListas();
  return (conteudo: ConteudoAdmin) => {
    clienteConsultas.setQueryData(chavesConteudosAdmin.detalhe(conteudo.id_conteudo), conteudo);
    invalidarListas();
  };
}

export function useCriarConteudo() {
  const aplicarResposta = useAplicarResposta();
  return useMutation({ mutationFn: criarConteudo, onSuccess: aplicarResposta });
}

export function useAtualizarConteudo(id: string) {
  const aplicarResposta = useAplicarResposta();
  return useMutation({
    mutationFn: (dados: AtualizarConteudo) => atualizarConteudo(id, dados),
    onSuccess: aplicarResposta,
  });
}

export function usePublicarConteudo() {
  const aplicarResposta = useAplicarResposta();
  return useMutation({ mutationFn: publicarConteudo, onSuccess: aplicarResposta });
}

export function useArquivarConteudo(id: string) {
  const invalidarListas = useInvalidarListas();
  const recarregar = useRecarregarConteudo(id);
  return useMutation({
    mutationFn: () => arquivarConteudo(id),
    onSuccess: () => {
      recarregar();
      invalidarListas();
    },
  });
}

export function usePreviaYoutube(url: string) {
  return useQuery({
    queryKey: chavesConteudosAdmin.previa(url),
    queryFn: () => previaYoutube(url),
    enabled: url !== "",
    retry: false,
    staleTime: Infinity,
  });
}
