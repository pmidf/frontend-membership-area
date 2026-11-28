"use client";

import { INTERVALO_REENVIO_SEGUNDOS } from "@/features/auth/components/confirmacao/BotaoReenviarCodigo";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { useContagemRegressiva } from "@/shared/hooks/useContagemRegressiva";
import { Botao, useAvisos } from "@/shared/ui";

import { useReenviarCodigoPmi } from "../api/filiacao.queries";
import { segundosDeEspera } from "../lib/mensagens-vinculacao";

type PropsBotaoReenviarCodigoPmi = {
  destacar?: boolean;
  aoReenviar?: () => void;
};

export function BotaoReenviarCodigoPmi({
  destacar = false,
  aoReenviar,
}: PropsBotaoReenviarCodigoPmi) {
  const contagem = useContagemRegressiva();
  const reenvio = useReenviarCodigoPmi();
  const avisos = useAvisos();

  function reenviar() {
    reenvio.mutate(undefined, {
      onSuccess: ({ email_pmi_mascarado }) => {
        contagem.reiniciar(INTERVALO_REENVIO_SEGUNDOS);
        avisos.sucesso(`Enviamos um novo código para ${email_pmi_mascarado}.`);
        aoReenviar?.();
      },
      onError: (erro) => {
        const espera = segundosDeEspera(erro, "AGUARDE_PARA_REENVIAR");
        if (espera !== null) contagem.reiniciar(espera);
        else avisos.erro(mensagemDeErro(erro));
      },
    });
  }

  return (
    <Botao
      type="button"
      variante={destacar && !contagem.ativa ? "secundario" : "link"}
      larguraTotal={destacar}
      disabled={contagem.ativa}
      carregando={reenvio.isPending}
      onClick={reenviar}
      className="self-center disabled:no-underline"
    >
      {contagem.ativa ? `Reenviar código (disponível em ${contagem.rotulo})` : "Reenviar código"}
    </Botao>
  );
}
