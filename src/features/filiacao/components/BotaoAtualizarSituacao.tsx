"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { useContagemRegressiva } from "@/shared/hooks/useContagemRegressiva";
import { Botao, useAvisos } from "@/shared/ui";

import { useAtualizarFiliacao, useMinhaFiliacao } from "../api/filiacao.queries";
import { CAMINHO_CODIGO_PMI } from "../lib/caminhos-filiacao";
import {
  avisosVinculacao,
  MENSAGEM_FILIACAO_EM_DIA,
  mensagemDeEspera,
  segundosAte,
  segundosDeEspera,
} from "../lib/mensagens-vinculacao";

type PropsBotaoAtualizarSituacao = { filiado: boolean };

export function BotaoAtualizarSituacao({ filiado }: PropsBotaoAtualizarSituacao) {
  const minha = useMinhaFiliacao();
  const proxima = minha.data?.proxima_atualizacao_em ?? null;

  return (
    <BotaoComContagem
      key={proxima ?? "liberado"}
      proximaAtualizacao={proxima}
      filiado={filiado}
      carregandoSituacao={minha.isPending}
    />
  );
}

type PropsBotaoComContagem = {
  proximaAtualizacao: string | null;
  filiado: boolean;
  carregandoSituacao: boolean;
};

function BotaoComContagem({
  proximaAtualizacao,
  filiado,
  carregandoSituacao,
}: PropsBotaoComContagem) {
  const roteador = useRouter();
  const avisos = useAvisos();
  const atualizacao = useAtualizarFiliacao();
  const [segundosIniciais] = useState(() => segundosAte(proximaAtualizacao, Date.now()));
  const contagem = useContagemRegressiva(segundosIniciais);

  async function atualizar() {
    try {
      const { resultado } = await atualizacao.mutateAsync(undefined);
      if (resultado === "CODIGO_ENVIADO") {
        roteador.push(CAMINHO_CODIGO_PMI);
        return;
      }
      if (!resultado) return;
      if (resultado === "APROVADO" && filiado) {
        avisos.sucesso(MENSAGEM_FILIACAO_EM_DIA);
        return;
      }
      const { tom, mensagem } = avisosVinculacao[resultado];
      avisos[tom](mensagem);
    } catch (erro) {
      const espera = segundosDeEspera(erro, "AGUARDE_PARA_ATUALIZAR");
      if (espera === null) {
        avisos.erro(mensagemDeErro(erro));
        return;
      }
      contagem.reiniciar(espera);
      avisos.informacao(mensagemDeEspera(espera));
    }
  }

  return (
    <Botao
      type="button"
      variante="secundario"
      tamanho="sm"
      disabled={contagem.ativa || carregandoSituacao}
      carregando={atualizacao.isPending}
      onClick={() => void atualizar()}
    >
      {contagem.ativa
        ? `Atualizar situação (disponível em ${contagem.rotulo})`
        : "Atualizar situação"}
    </Botao>
  );
}
