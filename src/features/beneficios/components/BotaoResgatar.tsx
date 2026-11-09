"use client";

import Link from "next/link";
import { useState } from "react";

import { caminhoDeConfirmacao } from "@/features/auth/lib/caminhos";
import { ehErroApi } from "@/shared/api/erro-api";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { useSessao } from "@/shared/sessao/useSessao";
import { Alerta, Botao, useAvisos } from "@/shared/ui";

import type { ResultadoResgate } from "../api/beneficios.api";
import { beneficioNaoEncontrado, useResgatarBeneficio } from "../api/beneficios.queries";
import type { DetalheBeneficio } from "../tipos/beneficio";
import { ModalCodigoResgate } from "./ModalCodigoResgate";
import { ModalFiliacaoNaoVigente } from "./ModalFiliacaoNaoVigente";
import { ModalInstrucaoResgate } from "./ModalInstrucaoResgate";

const MENSAGEM_NAO_DISPONIVEL = "Este benefício não está mais disponível.";
const MENSAGEM_LIMITE = "Você atingiu o limite de 10 resgates por hora. Tente mais tarde.";

function rotuloDoBotao({ resgatado, tipo_resgate }: DetalheBeneficio): string {
  if (!resgatado) return "Resgatar vantagem";
  return tipo_resgate === "CUPOM" ? "Ver código" : "Ver instruções";
}

function exigeFiliacao(erro: unknown): boolean {
  return ehErroApi(erro) && erro.codigo === "FILIACAO_NECESSARIA";
}

function AlertaDoResgate({ erro, email }: { erro: unknown; email: string }) {
  if (exigeFiliacao(erro) || beneficioNaoEncontrado(erro)) return null;
  if (ehErroApi(erro) && erro.codigo === "EMAIL_NAO_CONFIRMADO") {
    return (
      <Alerta tom="alerta" titulo="Confirme seu e-mail para resgatar.">
        <Link href={caminhoDeConfirmacao(email)} className="font-medium underline">
          Confirmar e-mail
        </Link>
      </Alerta>
    );
  }
  const limiteAtingido = ehErroApi(erro) && erro.status === 429;
  return <Alerta tom="erro" titulo={limiteAtingido ? MENSAGEM_LIMITE : mensagemDeErro(erro)} />;
}

export function BotaoResgatar({ beneficio }: { beneficio: DetalheBeneficio }) {
  const { perfil } = useSessao();
  const avisos = useAvisos();
  const resgate = useResgatarBeneficio(beneficio.id_beneficio);
  const [resultado, setResultado] = useState<ResultadoResgate | null>(null);
  const [modal, setModal] = useState<"resultado" | "sem-filiacao" | null>(null);

  function aoClicar() {
    if (resultado) {
      setModal("resultado");
      return;
    }
    resgate.mutate(undefined, {
      onSuccess: (dados) => {
        setResultado(dados);
        setModal("resultado");
      },
      onError: (erro) => {
        if (exigeFiliacao(erro)) setModal("sem-filiacao");
        if (beneficioNaoEncontrado(erro)) avisos.erro(MENSAGEM_NAO_DISPONIVEL);
      },
    });
  }

  function fecharResultado() {
    setModal(null);
    setResultado((atual) => atual && { ...atual, novo: false });
  }

  return (
    <>
      <Botao larguraTotal carregando={resgate.isPending} onClick={aoClicar}>
        {rotuloDoBotao(beneficio)}
      </Botao>
      {resgate.isError && <AlertaDoResgate erro={resgate.error} email={perfil?.email ?? ""} />}

      {modal === "resultado" && resultado?.resgate.tipo_resgate === "CUPOM" && (
        <ModalCodigoResgate
          resgate={resultado.resgate}
          novo={resultado.novo}
          aoFechar={fecharResultado}
        />
      )}
      {modal === "resultado" && resultado?.resgate.tipo_resgate === "INSTRUCAO" && (
        <ModalInstrucaoResgate
          conteudo={resultado.resgate.conteudo_entregue}
          dataRegistro={resultado.novo ? resultado.resgate.data_resgate : undefined}
          aoFechar={fecharResultado}
        />
      )}
      {modal === "sem-filiacao" && <ModalFiliacaoNaoVigente aoFechar={() => setModal(null)} />}
    </>
  );
}
