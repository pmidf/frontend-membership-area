import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ehErroApi } from "@/shared/api/erro-api";

import { adaptarPagina } from "../lib/adaptar-pagina";
import {
  detalharPessoa,
  listarPessoas,
  reativarPessoa,
  suspenderPessoa,
} from "./pessoas-admin.api";

export const TAMANHO_PAGINA_PESSOAS = 20;

type FiltrosLista = { busca: string; pagina: number };

const LISTA_SEM_BUSCA: FiltrosLista = { busca: "", pagina: 1 };

export const chavesPessoasAdmin = {
  todas: ["pessoas-admin"] as const,
  lista: (filtros: FiltrosLista) => ["pessoas-admin", "lista", filtros] as const,
  detalhe: (id: string) => ["pessoas-admin", "detalhe", id] as const,
};

export function pessoaNaoEncontrada(erro: unknown): boolean {
  return ehErroApi(erro) && (erro.status === 400 || erro.status === 404);
}

async function buscarPagina({ busca, pagina }: FiltrosLista) {
  const resposta = await listarPessoas({ busca, pagina, tamanho: TAMANHO_PAGINA_PESSOAS });
  return adaptarPagina(resposta);
}

export function usePessoas(filtros: FiltrosLista) {
  return useQuery({
    queryKey: chavesPessoasAdmin.lista(filtros),
    queryFn: () => buscarPagina(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useTotalPessoas() {
  return useQuery({
    queryKey: chavesPessoasAdmin.lista(LISTA_SEM_BUSCA),
    queryFn: () => buscarPagina(LISTA_SEM_BUSCA),
    select: (pagina) => pagina.total,
  });
}

export function usePessoa(id: string) {
  return useQuery({
    queryKey: chavesPessoasAdmin.detalhe(id),
    queryFn: () => detalharPessoa(id),
    retry: (falhas, erro) => !pessoaNaoEncontrada(erro) && falhas < 1,
  });
}

function useInvalidarPessoas() {
  const clienteConsultas = useQueryClient();
  return () => clienteConsultas.invalidateQueries({ queryKey: chavesPessoasAdmin.todas });
}

export function useSuspenderPessoa(id: string) {
  const invalidar = useInvalidarPessoas();
  return useMutation({
    mutationFn: (motivo: string) => suspenderPessoa(id, motivo),
    onSuccess: invalidar,
  });
}

export function useReativarPessoa(id: string) {
  const invalidar = useInvalidarPessoas();
  return useMutation({ mutationFn: () => reativarPessoa(id), onSuccess: invalidar });
}
