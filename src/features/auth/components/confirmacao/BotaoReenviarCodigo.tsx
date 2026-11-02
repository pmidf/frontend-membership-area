"use client";

import { ehErroApi } from "@/shared/api/erro-api";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { useContagemRegressiva } from "@/shared/hooks/useContagemRegressiva";
import { Botao, useAvisos } from "@/shared/ui";

import { useReenviarCodigo } from "../../api/auth.queries";

export const INTERVALO_REENVIO_SEGUNDOS = 120;

type PropsBotaoReenviarCodigo = {
  email: string;
  segundosIniciais: number;
  destacar?: boolean;
  aoReenviar?: () => void;
};

function segundosDeEspera(erro: unknown): number | null {
  if (!ehErroApi(erro) || erro.codigo !== "AGUARDE_PARA_REENVIAR") return null;
  const { segundos_restantes } = (erro.dados ?? {}) as { segundos_restantes?: number };
  return segundos_restantes ?? INTERVALO_REENVIO_SEGUNDOS;
}

export function BotaoReenviarCodigo({
  email,
  segundosIniciais,
  destacar = false,
  aoReenviar,
}: PropsBotaoReenviarCodigo) {
  const contagem = useContagemRegressiva(segundosIniciais);
  const reenvio = useReenviarCodigo();
  const avisos = useAvisos();

  function reenviar() {
    reenvio.mutate(email, {
      onSuccess: () => {
        contagem.reiniciar(INTERVALO_REENVIO_SEGUNDOS);
        avisos.sucesso(`Enviamos um novo código para ${email}.`);
        aoReenviar?.();
      },
      onError: (erro) => {
        const espera = segundosDeEspera(erro);
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
