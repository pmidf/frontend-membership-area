"use client";

import type { UseQueryResult } from "@tanstack/react-query";
import { useState } from "react";

import { ehErroApi } from "@/shared/api/erro-api";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { Botao, Cartao, DialogoConfirmacao, EstadoErro, Esqueleto, useAvisos } from "@/shared/ui";

import type { SessaoAtiva } from "../api/seguranca.api";
import { useEncerrarOutrasSessoes, useEncerrarSessao, useSessoes } from "../api/seguranca.queries";
import { descreverDispositivo } from "../lib/descrever-dispositivo";
import { ItemSessao } from "./ItemSessao";

type PropsConteudoSessoes = {
  sessoes: UseQueryResult<SessaoAtiva[]>;
  aoEncerrar: (sessao: SessaoAtiva) => void;
};

function ConteudoSessoes({ sessoes, aoEncerrar }: PropsConteudoSessoes) {
  if (sessoes.isPending) {
    return <Esqueleto variante="linha" quantidade={3} rotulo="Carregando suas sessões…" />;
  }
  if (sessoes.isError) {
    return (
      <EstadoErro
        compacto
        mensagem="Não foi possível carregar suas sessões."
        aoTentarNovamente={() => void sessoes.refetch()}
      />
    );
  }
  return (
    <ul aria-label="Sessões ativas" className="flex flex-col divide-y divide-borda-padrao">
      {sessoes.data.map((sessao) => (
        <ItemSessao key={sessao.id_sessao} sessao={sessao} aoEncerrar={aoEncerrar} />
      ))}
    </ul>
  );
}

export function ListaSessoes() {
  const avisos = useAvisos();
  const sessoes = useSessoes();
  const encerramento = useEncerrarSessao();
  const encerramentoOutras = useEncerrarOutrasSessoes();
  const [sessaoEscolhida, setSessaoEscolhida] = useState<SessaoAtiva | null>(null);
  const [confirmarOutras, setConfirmarOutras] = useState(false);

  const temOutras = (sessoes.data ?? []).some((sessao) => !sessao.atual);

  function encerrarEscolhida() {
    if (!sessaoEscolhida) return;
    encerramento.mutate(sessaoEscolhida.id_sessao, {
      onSuccess: () => avisos.sucesso("Sessão encerrada."),
      onError: (erro) => {
        if (!(ehErroApi(erro) && erro.status === 404)) avisos.erro(mensagemDeErro(erro));
      },
      onSettled: () => setSessaoEscolhida(null),
    });
  }

  function encerrarOutras() {
    encerramentoOutras.mutate(undefined, {
      onSuccess: () => {
        avisos.sucesso("As outras sessões foram encerradas.");
        setConfirmarOutras(false);
      },
      onError: (erro) => avisos.erro(mensagemDeErro(erro)),
    });
  }

  return (
    <Cartao className="flex flex-col gap-5 p-6">
      <div className="flex flex-col gap-1">
        <h3 className="text-corpo font-bold">Sessões ativas</h3>
        <p className="text-corpo-pequeno text-texto-secundario">
          Aparelhos conectados à sua conta, do acesso mais recente para o mais antigo.
        </p>
      </div>
      <ConteudoSessoes sessoes={sessoes} aoEncerrar={setSessaoEscolhida} />
      <div className="border-t border-borda-padrao pt-5">
        <Botao
          variante="perigo"
          tamanho="sm"
          disabled={!temOutras}
          onClick={() => setConfirmarOutras(true)}
        >
          Encerrar todas as outras sessões
        </Botao>
      </div>

      <DialogoConfirmacao
        aberto={sessaoEscolhida !== null}
        aoFechar={() => setSessaoEscolhida(null)}
        aoConfirmar={encerrarEscolhida}
        titulo="Encerrar sessão?"
        descricao={
          sessaoEscolhida &&
          `${descreverDispositivo(sessaoEscolhida.user_agent).descricao} será desconectado e precisará entrar de novo.`
        }
        rotuloConfirmar="Encerrar"
        tom="perigo"
        carregando={encerramento.isPending}
      />
      <DialogoConfirmacao
        aberto={confirmarOutras}
        aoFechar={() => setConfirmarOutras(false)}
        aoConfirmar={encerrarOutras}
        titulo="Encerrar todas as outras sessões?"
        descricao="Todos os outros aparelhos serão desconectados. Esta sessão continua ativa."
        rotuloConfirmar="Encerrar todas"
        tom="perigo"
        carregando={encerramentoOutras.isPending}
      />
    </Cartao>
  );
}
