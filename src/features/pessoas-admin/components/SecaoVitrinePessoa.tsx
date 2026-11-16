"use client";

import { useState } from "react";

import { ehErroApi } from "@/shared/api/erro-api";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { formatarData } from "@/shared/lib/datas";
import { Botao, Cartao, DialogoConfirmacao, useAvisos } from "@/shared/ui";

import type { PessoaDetalheAdmin } from "../api/pessoas-admin.api";
import {
  pessoaNaoEncontrada,
  useOcultarDaVitrine,
  useReexibirNaVitrine,
} from "../api/pessoas-admin.queries";

const MENSAGEM_NAO_ENCONTRADA = "Esta pessoa não foi encontrada. Os dados foram recarregados.";

function erroDaOcultacao(erro: unknown): string | undefined {
  if (!erro || pessoaNaoEncontrada(erro)) return undefined;
  if (ehErroApi(erro)) return erro.campos?.motivo?.[0] ?? mensagemDeErro(erro);
  return mensagemDeErro(erro);
}

function textoDoEstado(pessoa: PessoaDetalheAdmin): string {
  if (pessoa.vitrine_oculta) {
    const data = pessoa.data_vitrine_oculta
      ? ` em ${formatarData(pessoa.data_vitrine_oculta)}`
      : "";
    return `Oculta pelo Admin${data}. Motivo: ${pessoa.motivo_vitrine_oculta ?? "não informado"}`;
  }
  if (pessoa.exibida_na_vitrine) {
    return "Exibida na vitrine — ativada pela própria pessoa em Meu perfil > Preferências.";
  }
  return "Não aparece na vitrine (a pessoa não ativou a exibição ou não é filiada).";
}

export function SecaoVitrinePessoa({ pessoa }: { pessoa: PessoaDetalheAdmin }) {
  const avisos = useAvisos();
  const ocultacao = useOcultarDaVitrine(pessoa.id_pessoa);
  const reexibicao = useReexibirNaVitrine(pessoa.id_pessoa);
  const [dialogo, setDialogo] = useState<"ocultar" | "reexibir" | null>(null);

  function fechar() {
    setDialogo(null);
    ocultacao.reset();
    reexibicao.reset();
  }

  function aoFalhar(erro: unknown) {
    if (!pessoaNaoEncontrada(erro)) return;
    avisos.erro(MENSAGEM_NAO_ENCONTRADA);
    fechar();
  }

  function ocultar(motivo: string | undefined) {
    if (!motivo) return;
    ocultacao.mutate(motivo, {
      onSuccess: () => {
        avisos.sucesso("Profissional ocultado");
        fechar();
      },
      onError: aoFalhar,
    });
  }

  function reexibir() {
    reexibicao.mutate(undefined, {
      onSuccess: () => {
        avisos.sucesso("Profissional exibido novamente");
        fechar();
      },
      onError: aoFalhar,
    });
  }

  return (
    <Cartao className="flex flex-col items-start gap-4 p-6">
      <p className="text-corpo-pequeno text-texto-secundario">{textoDoEstado(pessoa)}</p>
      {pessoa.vitrine_oculta ? (
        <Botao variante="secundario" tamanho="sm" onClick={() => setDialogo("reexibir")}>
          Voltar a exibir
        </Botao>
      ) : (
        pessoa.exibida_na_vitrine && (
          <Botao variante="perigoContorno" tamanho="sm" onClick={() => setDialogo("ocultar")}>
            Ocultar da vitrine
          </Botao>
        )
      )}

      <DialogoConfirmacao
        aberto={dialogo === "ocultar"}
        aoFechar={fechar}
        aoConfirmar={ocultar}
        titulo="Ocultar da vitrine?"
        descricao={`${pessoa.nome_completo} deixará de aparecer em Profissionais da comunidade e receberá um e-mail com o motivo. A preferência da pessoa não muda.`}
        rotuloConfirmar="Ocultar da vitrine"
        tom="perigo"
        motivo={{ rotulo: "Motivo", obrigatorio: true, tamanhoMaximo: 500 }}
        carregando={ocultacao.isPending}
        erro={erroDaOcultacao(ocultacao.error)}
      />
      <DialogoConfirmacao
        aberto={dialogo === "reexibir"}
        aoFechar={fechar}
        aoConfirmar={reexibir}
        titulo="Voltar a exibir na vitrine?"
        descricao={`${pessoa.nome_completo} volta a aparecer se continuar filiada e com a exibição do perfil ativada.`}
        rotuloConfirmar="Voltar a exibir"
        carregando={reexibicao.isPending}
        erro={
          reexibicao.error && !pessoaNaoEncontrada(reexibicao.error)
            ? mensagemDeErro(reexibicao.error)
            : undefined
        }
      />
    </Cartao>
  );
}
