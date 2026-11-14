import { useQuery } from "@tanstack/react-query";

import { ehErroApi } from "@/shared/api/erro-api";
import { useSessao } from "@/shared/sessao/useSessao";

import { detalharConcluido, obterPainel } from "./gamificacao.api";

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
