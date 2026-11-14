"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { DESTINO_PADRAO } from "@/shared/sessao/destino-seguro";
import { CarregandoSessao } from "@/shared/sessao/ExigeLogin";
import { useSessao } from "@/shared/sessao/useSessao";
import { useAvisos } from "@/shared/ui";

import type { RespostaConfirmacao, ResultadoVinculacao } from "../../api/auth.api";
import type { OrigemConfirmacao } from "../../lib/caminhos";
import { MENSAGEM_BOAS_VINDAS } from "../../lib/mensagens-resultado-filiacao";
import { INTERVALO_REENVIO_SEGUNDOS } from "./BotaoReenviarCodigo";
import { FormularioConfirmacao } from "./FormularioConfirmacao";
import { InformarEmail } from "./InformarEmail";
import { ResultadoFiliacao } from "./ResultadoFiliacao";

type PropsConfirmacaoEmail = {
  emailInicial: string;
  origem: OrigemConfirmacao | null;
};

export function ConfirmacaoEmail({ emailInicial, origem }: PropsConfirmacaoEmail) {
  const roteador = useRouter();
  const sessao = useSessao();
  const avisos = useAvisos();
  const [email, setEmail] = useState(emailInicial);
  const [confirmou, setConfirmou] = useState(false);
  const [resultado, setResultado] = useState<ResultadoVinculacao | null>(null);

  useEffect(() => {
    if (sessao.estado === "autenticado" && !confirmou) roteador.replace(DESTINO_PADRAO);
  }, [sessao.estado, confirmou, roteador]);

  async function aoConfirmar(resposta: RespostaConfirmacao) {
    setConfirmou(true);
    setResultado(resposta.filiacao.resultado);
    await sessao.entrar(resposta);
    if (resposta.filiacao.resultado) return;
    avisos.sucesso(MENSAGEM_BOAS_VINDAS);
    roteador.replace(DESTINO_PADRAO);
  }

  if (resultado) return <ResultadoFiliacao resultado={resultado} />;
  if (confirmou || sessao.estado !== "anonimo") return <CarregandoSessao />;
  if (!email) return <InformarEmail aoInformar={setEmail} />;

  const vindoDoCadastro = Boolean(emailInicial) && origem === null;

  return (
    <FormularioConfirmacao
      email={email}
      vindoDoLogin={origem === "login"}
      segundosParaReenvio={vindoDoCadastro ? INTERVALO_REENVIO_SEGUNDOS : 0}
      aoConfirmar={aoConfirmar}
    />
  );
}

export function ConfirmacaoEmailPelaUrl() {
  const parametros = useSearchParams();
  const origem = parametros.get("origem") === "login" ? "login" : null;

  return <ConfirmacaoEmail emailInicial={parametros.get("email") ?? ""} origem={origem} />;
}
