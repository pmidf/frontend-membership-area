import { useQueries, useQuery } from "@tanstack/react-query";

import { detalharPessoa } from "@/features/pessoas-admin/api/pessoas-admin.api";
import {
  chavesPessoasAdmin,
  pessoaNaoEncontrada,
} from "@/features/pessoas-admin/api/pessoas-admin.queries";

import { chavesGamificacaoAdmin } from "./quebra-cabecas.queries";
import { obterRanking } from "./ranking.api";

export const chavesRanking = {
  ranking: [...chavesGamificacaoAdmin.todas, "ranking"] as const,
};

export type NomeNoRanking =
  | { estado: "carregando" }
  | { estado: "encontrado"; nome: string }
  | { estado: "removida" }
  | { estado: "erro" };

export function useRanking() {
  return useQuery({ queryKey: chavesRanking.ranking, queryFn: obterRanking });
}

export function useNomesDoRanking(ids: string[]): Record<string, NomeNoRanking> {
  const consultas = useQueries({
    queries: ids.map((id) => ({
      queryKey: chavesPessoasAdmin.detalhe(id),
      queryFn: () => detalharPessoa(id),
      retry: (falhas: number, erro: unknown) => !pessoaNaoEncontrada(erro) && falhas < 1,
    })),
  });

  return Object.fromEntries(
    ids.map((id, indice): [string, NomeNoRanking] => {
      const consulta = consultas[indice];
      if (consulta.data) return [id, { estado: "encontrado", nome: consulta.data.nome_completo }];
      if (pessoaNaoEncontrada(consulta.error)) return [id, { estado: "removida" }];
      if (consulta.isError) return [id, { estado: "erro" }];
      return [id, { estado: "carregando" }];
    }),
  );
}
