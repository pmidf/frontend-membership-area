import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { chavesBeneficios } from "@/features/beneficios/api/beneficios.queries";
import { ehErroApi } from "@/shared/api/erro-api";

import type { ConsultaBeneficiosAdmin, SituacaoBeneficio } from "../tipos/beneficio-admin";
import {
  atualizarBeneficio,
  detalharBeneficioAdmin,
  duplicarBeneficio,
  exportarBeneficios,
  listarBeneficiosAdmin,
  mudarSituacaoBeneficio,
  type AcaoDeSituacao,
  type AtualizarBeneficio,
  type BeneficioAdmin,
} from "./beneficios-admin.api";

export const chavesBeneficiosAdmin = {
  todas: ["beneficios-admin"] as const,
  lista: (consulta: ConsultaBeneficiosAdmin) => ["beneficios-admin", "lista", consulta] as const,
  total: (situacao: SituacaoBeneficio) => ["beneficios-admin", "total", situacao] as const,
  detalhe: (id: string) => ["beneficios-admin", "detalhe", id] as const,
};

export function beneficioAdminNaoEncontrado(erro: unknown): boolean {
  return ehErroApi(erro) && erro.status === 404;
}

export function useBeneficiosAdmin(consulta: ConsultaBeneficiosAdmin) {
  return useQuery({
    queryKey: chavesBeneficiosAdmin.lista(consulta),
    queryFn: () => listarBeneficiosAdmin(consulta),
    placeholderData: keepPreviousData,
  });
}

export function useTotalPorSituacao(situacao: SituacaoBeneficio) {
  return useQuery({
    queryKey: chavesBeneficiosAdmin.total(situacao),
    queryFn: () => listarBeneficiosAdmin({ situacao }),
    select: (pagina) => pagina.total,
  });
}

export function useExportarBeneficios() {
  return useMutation({ mutationFn: exportarBeneficios });
}

export function useBeneficioAdmin(id: string) {
  return useQuery({
    queryKey: chavesBeneficiosAdmin.detalhe(id),
    queryFn: () => detalharBeneficioAdmin(id),
    retry: (falhas, erro) => !beneficioAdminNaoEncontrado(erro) && falhas < 1,
  });
}

export function useRecarregarBeneficio(id: string) {
  const clienteConsultas = useQueryClient();
  return () => {
    void clienteConsultas.invalidateQueries({ queryKey: chavesBeneficiosAdmin.detalhe(id) });
  };
}

function useAplicarResposta() {
  const clienteConsultas = useQueryClient();
  return (beneficio: BeneficioAdmin) => {
    clienteConsultas.setQueryData(chavesBeneficiosAdmin.detalhe(beneficio.id_beneficio), beneficio);
    void clienteConsultas.invalidateQueries({
      queryKey: chavesBeneficiosAdmin.todas,
      predicate: ({ queryKey }) => queryKey[1] !== "detalhe",
    });
    void clienteConsultas.invalidateQueries({ queryKey: chavesBeneficios.listas });
  };
}

export function useAtualizarBeneficio(id: string) {
  const aplicarResposta = useAplicarResposta();
  return useMutation({
    mutationFn: (dados: AtualizarBeneficio) => atualizarBeneficio(id, dados),
    onSuccess: aplicarResposta,
  });
}

function useMudarSituacao(id: string, acao: AcaoDeSituacao) {
  const aplicarResposta = useAplicarResposta();
  return useMutation({
    mutationFn: () => mudarSituacaoBeneficio(id, acao),
    onSuccess: aplicarResposta,
  });
}

export const usePublicarBeneficio = (id: string) => useMudarSituacao(id, "publicar");
export const useDespublicarBeneficio = (id: string) => useMudarSituacao(id, "despublicar");
export const useArquivarBeneficio = (id: string) => useMudarSituacao(id, "arquivar");

export function useDuplicarBeneficio() {
  const aplicarResposta = useAplicarResposta();
  return useMutation({ mutationFn: duplicarBeneficio, onSuccess: aplicarResposta });
}
