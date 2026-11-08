"use client";

import { useState } from "react";

import { ehErroApi } from "@/shared/api/erro-api";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { useSessao } from "@/shared/sessao/useSessao";
import { Botao, Cartao, DialogoConfirmacao, SeloStatus, useAvisos } from "@/shared/ui";

import type { PessoaDetalheAdmin } from "../api/pessoas-admin.api";
import { useReativarPessoa, useSuspenderPessoa } from "../api/pessoas-admin.queries";

const MENSAGEM_ULTIMO_ADMIN = "Esta pessoa é o único administrador ativo e não pode ser suspensa.";

function erroDaSuspensao(erro: unknown): string | undefined {
  if (!erro) return undefined;
  if (!ehErroApi(erro)) return mensagemDeErro(erro);
  if (erro.codigo === "ULTIMO_ADMIN") return MENSAGEM_ULTIMO_ADMIN;
  return erro.campos?.motivo?.[0] ?? mensagemDeErro(erro);
}

export function SituacaoConta({ pessoa }: { pessoa: PessoaDetalheAdmin }) {
  const { perfil } = useSessao();
  const avisos = useAvisos();
  const suspensao = useSuspenderPessoa(pessoa.id_pessoa);
  const reativacao = useReativarPessoa(pessoa.id_pessoa);
  const [dialogo, setDialogo] = useState<"suspender" | "reativar" | null>(null);

  const ativa = pessoa.situacao_conta === "ATIVA";
  const propriaConta = perfil?.id_pessoa === pessoa.id_pessoa;

  function fechar() {
    setDialogo(null);
    suspensao.reset();
    reativacao.reset();
  }

  function suspender(motivo: string | undefined) {
    if (!motivo) return;
    suspensao.mutate(motivo, {
      onSuccess: () => {
        avisos.sucesso("Conta suspensa.");
        fechar();
      },
    });
  }

  function reativar() {
    reativacao.mutate(undefined, {
      onSuccess: () => {
        avisos.sucesso("Conta reativada.");
        fechar();
      },
    });
  }

  return (
    <Cartao className="flex flex-col items-start gap-4 p-6">
      <SeloStatus tom={ativa ? "aqua" : "erro"}>
        {ativa ? "Conta ativa" : "Conta suspensa"}
      </SeloStatus>
      <p className="text-corpo-pequeno">
        {ativa
          ? "Suspender remove o acesso imediatamente, mas preserva todo o histórico da pessoa."
          : "A pessoa não consegue entrar enquanto a conta estiver suspensa."}
      </p>
      {!ativa && (
        <Botao variante="secundario" tamanho="sm" onClick={() => setDialogo("reativar")}>
          Reativar conta
        </Botao>
      )}
      {ativa && !propriaConta && (
        <Botao variante="perigoContorno" tamanho="sm" onClick={() => setDialogo("suspender")}>
          Suspender conta
        </Botao>
      )}
      {ativa && propriaConta && (
        <p className="text-legenda text-texto-secundario">
          Você não pode suspender a própria conta.
        </p>
      )}

      <DialogoConfirmacao
        aberto={dialogo === "suspender"}
        aoFechar={fechar}
        aoConfirmar={suspender}
        titulo="Suspender conta?"
        descricao={`${pessoa.nome_completo} perderá o acesso imediatamente. O histórico será preservado.`}
        rotuloConfirmar="Suspender conta"
        tom="perigo"
        motivo={{ rotulo: "Motivo", obrigatorio: true, tamanhoMinimo: 5, tamanhoMaximo: 500 }}
        carregando={suspensao.isPending}
        erro={erroDaSuspensao(suspensao.error)}
      />
      <DialogoConfirmacao
        aberto={dialogo === "reativar"}
        aoFechar={fechar}
        aoConfirmar={reativar}
        titulo="Reativar conta?"
        descricao={`${pessoa.nome_completo} voltará a poder entrar na plataforma.`}
        rotuloConfirmar="Reativar conta"
        carregando={reativacao.isPending}
        erro={reativacao.error ? mensagemDeErro(reativacao.error) : undefined}
      />
    </Cartao>
  );
}
