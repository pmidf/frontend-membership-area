import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ehErroApi } from "@/shared/api/erro-api";

import type { EditarQuebraCabeca } from "../tipos/quebra-cabeca-admin";
import {
  criarQuebraCabeca,
  detalharQuebraCabeca,
  editarQuebraCabeca,
  listarQuebraCabecas,
  mudarSituacaoQuebraCabeca,
  publicarQuebraCabeca,
  type AcaoDeSituacao,
} from "./quebra-cabecas.api";

export const chavesGamificacaoAdmin = {
  todas: ["gamificacao-admin"] as const,
  lista: ["gamificacao-admin", "lista"] as const,
  detalhe: (id: string) => ["gamificacao-admin", "detalhe", id] as const,
};

export function transicaoInvalida(erro: unknown): boolean {
  return ehErroApi(erro) && erro.status === 409 && erro.codigo === "TRANSICAO_INVALIDA";
}

export function situacaoDesatualizada(erro: unknown): boolean {
  return transicaoInvalida(erro) || quebraCabecaNaoEncontrado(erro);
}

export function quebraCabecaNaoEncontrado(erro: unknown): boolean {
  return ehErroApi(erro) && erro.status === 404;
}

export function conflitoDeEdicao(erro: unknown): "IMAGEM_BLOQUEADA" | "FORA_DO_AR" | null {
  if (!ehErroApi(erro) || erro.status !== 409) return null;
  if (erro.codigo === "IMAGEM_BLOQUEADA") return "IMAGEM_BLOQUEADA";
  if (erro.codigo === "QUEBRA_CABECA_FORA_DO_AR") return "FORA_DO_AR";
  return null;
}

function useRecarregarLista() {
  const clienteConsultas = useQueryClient();
  return () => clienteConsultas.invalidateQueries({ queryKey: chavesGamificacaoAdmin.todas });
}

export function useRecarregarQuebraCabeca(id: string) {
  const clienteConsultas = useQueryClient();
  return () => clienteConsultas.invalidateQueries({ queryKey: chavesGamificacaoAdmin.detalhe(id) });
}

export function useQuebraCabecasAdmin() {
  return useQuery({ queryKey: chavesGamificacaoAdmin.lista, queryFn: listarQuebraCabecas });
}

export function useCriarQuebraCabeca() {
  const recarregarLista = useRecarregarLista();
  return useMutation({
    mutationFn: criarQuebraCabeca,
    onSuccess: () => void recarregarLista(),
  });
}

export function usePublicarQuebraCabeca() {
  const recarregarLista = useRecarregarLista();
  return useMutation({
    mutationFn: publicarQuebraCabeca,
    onSettled: () => void recarregarLista(),
  });
}

export function useQuebraCabecaAdmin(id: string) {
  return useQuery({
    queryKey: chavesGamificacaoAdmin.detalhe(id),
    queryFn: () => detalharQuebraCabeca(id),
    retry: (falhas, erro) => !quebraCabecaNaoEncontrado(erro) && falhas < 1,
  });
}

export function useEditarQuebraCabeca(id: string) {
  const recarregar = useRecarregarLista();
  return useMutation({
    mutationFn: (dados: EditarQuebraCabeca) => editarQuebraCabeca(id, dados),
    onSettled: () => void recarregar(),
  });
}

export function useMudarSituacaoQuebraCabeca() {
  const recarregar = useRecarregarLista();
  return useMutation({
    mutationFn: ({ id, acao }: { id: string; acao: AcaoDeSituacao }) =>
      mudarSituacaoQuebraCabeca(id, acao),
    onSettled: () => void recarregar(),
  });
}
