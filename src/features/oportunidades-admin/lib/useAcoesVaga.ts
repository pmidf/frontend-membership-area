"use client";

import { useRouter } from "next/navigation";

import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { useAvisos } from "@/shared/ui";

import {
  conflitoDeSituacao,
  useDuplicarOportunidade,
  useEncerrarOportunidade,
  usePublicarOportunidade,
} from "../api/oportunidades-admin.queries";
import { caminhoDaVaga } from "./caminhos";

export function useAcoesVaga() {
  const roteador = useRouter();
  const avisos = useAvisos();
  const publicacao = usePublicarOportunidade();
  const encerramento = useEncerrarOportunidade();
  const duplicacao = useDuplicarOportunidade();

  function avisarFalha(erro: unknown) {
    if (conflitoDeSituacao(erro)) avisos.informacao(mensagemDeErro(erro));
    else avisos.erro(mensagemDeErro(erro));
  }

  async function executar(acao: () => Promise<unknown>, sucesso: string): Promise<boolean> {
    try {
      await acao();
      avisos.sucesso(sucesso);
      return true;
    } catch (erro) {
      avisarFalha(erro);
      return false;
    }
  }

  return {
    publicando: publicacao.isPending,
    encerrando: encerramento.isPending,
    duplicando: duplicacao.isPending,
    ocupado: publicacao.isPending || encerramento.isPending || duplicacao.isPending,
    publicar: (id: string) => executar(() => publicacao.mutateAsync(id), "Vaga publicada"),
    encerrar: (id: string, motivo?: string) =>
      executar(() => encerramento.mutateAsync({ id, motivo }), "Vaga encerrada"),
    duplicar: (id: string) =>
      executar(async () => {
        const duplicada = await duplicacao.mutateAsync(id);
        roteador.push(caminhoDaVaga(duplicada.id_oportunidade));
      }, "Rascunho criado"),
  };
}
