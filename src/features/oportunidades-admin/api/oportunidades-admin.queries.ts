import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ehErroApi } from "@/shared/api/erro-api";

import type { AtualizarOportunidade, OportunidadeAdmin } from "../tipos/oportunidade-admin";
import {
  atualizarOportunidade,
  criarOportunidade,
  detalharOportunidadeAdmin,
  previewOportunidade,
  publicarOportunidade,
} from "./oportunidades-admin.api";

export const chavesOportunidadesAdmin = {
  todas: ["oportunidades-admin"] as const,
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

function useAplicarResposta() {
  const clienteConsultas = useQueryClient();
  return (oportunidade: OportunidadeAdmin) => {
    clienteConsultas.setQueryData(
      chavesOportunidadesAdmin.detalhe(oportunidade.id_oportunidade),
      oportunidade,
    );
    void clienteConsultas.invalidateQueries({
      queryKey: chavesOportunidadesAdmin.todas,
      predicate: ({ queryKey }) => queryKey[1] !== "detalhe",
    });
    void clienteConsultas.invalidateQueries({ queryKey: CHAVE_OPORTUNIDADES_FILIADO });
  };
}

export function useCriarOportunidade() {
  const aplicarResposta = useAplicarResposta();
  return useMutation({ mutationFn: criarOportunidade, onSuccess: aplicarResposta });
}

export function useAtualizarOportunidade(id: string) {
  const aplicarResposta = useAplicarResposta();
  return useMutation({
    mutationFn: (dados: AtualizarOportunidade) => atualizarOportunidade(id, dados),
    onSuccess: aplicarResposta,
  });
}

export function usePublicarOportunidade() {
  const clienteConsultas = useQueryClient();
  const aplicarResposta = useAplicarResposta();
  return useMutation({
    mutationFn: publicarOportunidade,
    onSuccess: aplicarResposta,
    onError: (erro, id) => {
      if (!conflitoDeSituacao(erro)) return;
      void clienteConsultas.invalidateQueries({ queryKey: chavesOportunidadesAdmin.detalhe(id) });
    },
  });
}
