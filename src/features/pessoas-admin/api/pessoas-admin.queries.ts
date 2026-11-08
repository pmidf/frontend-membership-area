import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { adaptarPagina } from "../lib/adaptar-pagina";
import { listarPessoas } from "./pessoas-admin.api";

export const TAMANHO_PAGINA_PESSOAS = 20;

type FiltrosLista = { busca: string; pagina: number };

const LISTA_SEM_BUSCA: FiltrosLista = { busca: "", pagina: 1 };

export const chavesPessoasAdmin = {
  todas: ["pessoas-admin"] as const,
  lista: (filtros: FiltrosLista) => ["pessoas-admin", "lista", filtros] as const,
};

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
