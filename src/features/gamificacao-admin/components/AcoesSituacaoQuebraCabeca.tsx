"use client";

import { useState } from "react";

import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { Botao, DialogoConfirmacao, useAvisos } from "@/shared/ui";

import type { AcaoDeSituacao } from "../api/quebra-cabecas.api";
import { situacaoDesatualizada, useMudarSituacaoQuebraCabeca } from "../api/quebra-cabecas.queries";
import { acoesPorSituacao } from "../lib/acoes-por-situacao";
import type { SituacaoQuebraCabeca } from "../tipos/quebra-cabeca-admin";

export const MENSAGEM_SITUACAO_MUDOU = "A situação mudou. Atualizamos a lista.";

const CONFIGURACAO: Record<
  AcaoDeSituacao,
  {
    rotulo: string;
    variante: "perigoContorno" | "secundario";
    titulo: (nome: string) => string;
    descricao: string;
    confirmar: string;
    tom: "perigo" | "primario";
    sucesso: string;
  }
> = {
  "tirar-do-ar": {
    rotulo: "⨯ Tirar do ar",
    variante: "perigoContorno",
    titulo: (nome) => `Tirar "${nome}" do ar?`,
    descricao:
      "O quebra-cabeça sai do sorteio. Quem já está montando continua normalmente; quem concluiu mantém na coleção.",
    confirmar: "Tirar do ar",
    tom: "perigo",
    sucesso: "Quebra-cabeça fora do ar",
  },
  "subir-novamente": {
    rotulo: "↑ Subir novamente",
    variante: "secundario",
    titulo: (nome) => `Subir "${nome}" novamente?`,
    descricao: "O quebra-cabeça volta ao sorteio dos filiados.",
    confirmar: "Subir novamente",
    tom: "primario",
    sucesso: "Quebra-cabeça publicado de novo",
  },
};

function ehAcaoDeSituacao(acao: string): acao is AcaoDeSituacao {
  return acao === "tirar-do-ar" || acao === "subir-novamente";
}

type PropsAcoesSituacaoQuebraCabeca = {
  id: string;
  nome: string;
  situacao: SituacaoQuebraCabeca;
  tamanho?: "sm" | "md";
  larguraTotal?: boolean;
};

export function AcoesSituacaoQuebraCabeca({
  id,
  nome,
  situacao,
  tamanho = "sm",
  larguraTotal = false,
}: PropsAcoesSituacaoQuebraCabeca) {
  const avisos = useAvisos();
  const mudanca = useMudarSituacaoQuebraCabeca();
  const [confirmando, setConfirmando] = useState<AcaoDeSituacao | null>(null);
  const acao = acoesPorSituacao(situacao).find(ehAcaoDeSituacao);
  if (!acao) return null;
  const configuracao = CONFIGURACAO[acao];
  const emConfirmacao = confirmando ? CONFIGURACAO[confirmando] : null;

  function confirmar() {
    if (!confirmando) return;
    mudanca.mutate(
      { id, acao: confirmando },
      {
        onSuccess: () => avisos.sucesso(CONFIGURACAO[confirmando].sucesso),
        onError: (erro) =>
          situacaoDesatualizada(erro)
            ? avisos.informacao(MENSAGEM_SITUACAO_MUDOU)
            : avisos.erro(mensagemDeErro(erro)),
        onSettled: () => setConfirmando(null),
      },
    );
  }

  return (
    <>
      <Botao
        variante={configuracao.variante}
        tamanho={tamanho}
        larguraTotal={larguraTotal}
        aria-label={`${configuracao.confirmar}: ${nome}`}
        aria-haspopup="dialog"
        onClick={() => setConfirmando(acao)}
      >
        {configuracao.rotulo}
      </Botao>
      <DialogoConfirmacao
        aberto={emConfirmacao !== null}
        aoFechar={() => setConfirmando(null)}
        aoConfirmar={confirmar}
        titulo={emConfirmacao?.titulo(nome) ?? ""}
        descricao={emConfirmacao?.descricao}
        rotuloConfirmar={emConfirmacao?.confirmar ?? ""}
        tom={emConfirmacao?.tom}
        carregando={mudanca.isPending}
      />
    </>
  );
}
