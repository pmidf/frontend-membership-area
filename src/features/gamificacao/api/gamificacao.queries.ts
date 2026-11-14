import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ehErroApi } from "@/shared/api/erro-api";
import { useSessao } from "@/shared/sessao/useSessao";

import type { PainelGamificacao } from "../tipos/gamificacao";
import { detalharConcluido, obterPainel, sortearQuebraCabeca } from "./gamificacao.api";

export const chavesGamificacao = {
  painel: ["gamificacao", "painel"] as const,
  concluido: (progressoId: string) => ["gamificacao", "concluido", progressoId] as const,
};

export function filiacaoNecessaria(erro: unknown): boolean {
  return ehErroApi(erro) && erro.status === 403;
}

export function quebraCabecaNaoEncontrado(erro: unknown): boolean {
  return ehErroApi(erro) && erro.status === 404;
}

function semRepetirErroDeNegocio(falhas: number, erro: unknown): boolean {
  return !filiacaoNecessaria(erro) && !quebraCabecaNaoEncontrado(erro) && falhas < 1;
}

export function usePainelGamificacao() {
  const { estado, ehFiliado } = useSessao();
  return useQuery({
    queryKey: chavesGamificacao.painel,
    queryFn: obterPainel,
    enabled: estado === "autenticado" && ehFiliado,
    retry: semRepetirErroDeNegocio,
  });
}

export function useConcluido(progressoId: string | null) {
  return useQuery({
    queryKey: chavesGamificacao.concluido(progressoId ?? ""),
    queryFn: () => detalharConcluido(progressoId ?? ""),
    enabled: progressoId !== null,
    retry: semRepetirErroDeNegocio,
  });
}

export type MotivoSemSorteio = "COLECAO_COMPLETA" | "CATALOGO_VAZIO";

export function motivoSemSorteio(erro: unknown): MotivoSemSorteio | null {
  if (!ehErroApi(erro) || erro.status !== 409) return null;
  return erro.codigo === "COLECAO_COMPLETA" || erro.codigo === "CATALOGO_VAZIO"
    ? erro.codigo
    : null;
}

function erroQueMudaOPainel(erro: unknown): boolean {
  return ehErroApi(erro) && (erro.status === 403 || erro.status === 409);
}

export function useSortearQuebraCabeca() {
  const clienteConsultas = useQueryClient();
  const recarregarPainel = () =>
    clienteConsultas.invalidateQueries({ queryKey: chavesGamificacao.painel });

  return useMutation({
    mutationFn: sortearQuebraCabeca,
    onSuccess: (sorteado) => {
      clienteConsultas.setQueryData<PainelGamificacao>(chavesGamificacao.painel, (painel) =>
        painel
          ? {
              ...painel,
              creditos: sorteado.creditos,
              em_andamento: {
                pecas_obtidas: sorteado.pecas_obtidas,
                total_pecas: sorteado.total_pecas,
                pecas: [],
              },
            }
          : painel,
      );
      void recarregarPainel();
    },
    onError: (erro) => {
      if (erroQueMudaOPainel(erro)) void recarregarPainel();
    },
  });
}
