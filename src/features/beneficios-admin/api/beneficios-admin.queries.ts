import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { chavesBeneficios } from "@/features/beneficios/api/beneficios.queries";
import { ehErroApi } from "@/shared/api/erro-api";

import type { ConsultaBeneficiosAdmin, SituacaoBeneficio } from "../tipos/beneficio-admin";
import {
  atualizarBeneficio,
  criarBeneficio,
  criarParceiro,
  detalharBeneficioAdmin,
  duplicarBeneficio,
  exportarBeneficios,
  exportarRelatorioResgates,
  listarBeneficiosAdmin,
  listarParceiros,
  mudarSituacaoBeneficio,
  obterRelatorioResgates,
  type AcaoDeSituacao,
  type AtualizarBeneficio,
  type BeneficioAdmin,
  type Parceiro,
} from "./beneficios-admin.api";

export const chavesBeneficiosAdmin = {
  todas: ["beneficios-admin"] as const,
  lista: (consulta: ConsultaBeneficiosAdmin) => ["beneficios-admin", "lista", consulta] as const,
  total: (situacao: SituacaoBeneficio) => ["beneficios-admin", "total", situacao] as const,
  detalhe: (id: string) => ["beneficios-admin", "detalhe", id] as const,
  parceiros: ["beneficios-admin", "parceiros"] as const,
  relatorio: (ano: number) => ["beneficios-admin", "relatorio", ano] as const,
};

export function beneficioAdminNaoEncontrado(erro: unknown): boolean {
  return ehErroApi(erro) && erro.status === 404;
}

const erroDoCliente = (erro: unknown) => ehErroApi(erro) && erro.status >= 400 && erro.status < 500;

export function useRelatorioResgates(ano: number) {
  return useQuery({
    queryKey: chavesBeneficiosAdmin.relatorio(ano),
    queryFn: () => obterRelatorioResgates(ano),
    placeholderData: keepPreviousData,
    retry: (falhas, erro) => !erroDoCliente(erro) && falhas < 1,
  });
}

export function useExportarRelatorioResgates() {
  return useMutation({ mutationFn: exportarRelatorioResgates });
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
      predicate: ({ queryKey }) => queryKey[1] !== "detalhe" && queryKey[1] !== "parceiros",
    });
    void clienteConsultas.invalidateQueries({ queryKey: chavesBeneficios.listas });
  };
}

export function useParceiros() {
  return useQuery({
    queryKey: chavesBeneficiosAdmin.parceiros,
    queryFn: listarParceiros,
    staleTime: 5 * 60_000,
  });
}

export function parceiroJaExiste(erro: unknown): boolean {
  return ehErroApi(erro) && erro.status === 409;
}

export function useCriarParceiro() {
  const clienteConsultas = useQueryClient();
  return useMutation({
    mutationFn: criarParceiro,
    onSuccess: (novo) => {
      clienteConsultas.setQueryData<Parceiro[]>(chavesBeneficiosAdmin.parceiros, (atuais) =>
        [...(atuais ?? []).filter((p) => p.cod_parceiro !== novo.cod_parceiro), novo].sort((a, b) =>
          a.nome.localeCompare(b.nome, "pt-BR"),
        ),
      );
      void clienteConsultas.invalidateQueries({ queryKey: chavesBeneficiosAdmin.parceiros });
    },
  });
}

export function useCriarBeneficio() {
  const aplicarResposta = useAplicarResposta();
  return useMutation({ mutationFn: criarBeneficio, onSuccess: aplicarResposta });
}

export function usePublicarBeneficioCriado() {
  const aplicarResposta = useAplicarResposta();
  return useMutation({
    mutationFn: (id: string) => mudarSituacaoBeneficio(id, "publicar"),
    onSuccess: aplicarResposta,
  });
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
