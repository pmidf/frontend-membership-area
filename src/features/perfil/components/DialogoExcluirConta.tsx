"use client";

import { useState, type FormEvent } from "react";

import { ehErroApi } from "@/shared/api/erro-api";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { useSessao } from "@/shared/sessao/useSessao";
import { Alerta, Botao, CampoSenha, Modal, useAvisos } from "@/shared/ui";

import { useExcluirConta } from "../api/perfil.queries";

const ID_FORMULARIO = "formulario-excluir-conta";

const mensagensDeBloqueio: Record<string, string> = {
  ULTIMO_ADMIN:
    "Você é o único administrador ativo. Conceda o papel de Admin a outra pessoa antes de excluir sua conta.",
  CONTA_COM_PUBLICACOES:
    "Sua conta publicou conteúdos ou vagas e não pode ser excluída. Fale com outro administrador.",
};

function erroDoCampo(erro: unknown): string | undefined {
  if (!ehErroApi(erro)) return undefined;
  return erro.codigo === "SENHA_INCORRETA" ? mensagemDeErro(erro) : erro.campos?.senha?.[0];
}

function erroGeral(erro: unknown): string {
  return (ehErroApi(erro) && mensagensDeBloqueio[erro.codigo]) || mensagemDeErro(erro);
}

export function DialogoExcluirConta({ aoFechar }: { aoFechar: () => void }) {
  const { sairLocalmente } = useSessao();
  const avisos = useAvisos();
  const exclusao = useExcluirConta();
  const [senha, setSenha] = useState("");

  function confirmar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!senha || exclusao.isPending) return;
    exclusao.mutate(senha, {
      onSuccess: () => {
        avisos.sucesso("Sua conta foi excluída.");
        sairLocalmente();
      },
    });
  }

  const erroSenha = erroDoCampo(exclusao.error);

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo="Excluir sua conta?"
      descricao="Seus dados pessoais, e-mails, sessões e histórico na plataforma serão apagados de forma definitiva. Esta ação não pode ser desfeita."
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar} disabled={exclusao.isPending}>
            Cancelar
          </Botao>
          <Botao
            type="submit"
            form={ID_FORMULARIO}
            variante="perigo"
            disabled={!senha}
            carregando={exclusao.isPending}
          >
            Excluir definitivamente
          </Botao>
        </>
      }
    >
      <form id={ID_FORMULARIO} noValidate onSubmit={confirmar} className="flex flex-col gap-4">
        <CampoSenha
          rotulo="Confirme com sua senha"
          autoComplete="current-password"
          data-foco-inicial
          value={senha}
          erro={erroSenha}
          onChange={(evento) => {
            setSenha(evento.target.value);
            if (exclusao.isError) exclusao.reset();
          }}
        />
        {exclusao.isError && !erroSenha && <Alerta tom="erro" titulo={erroGeral(exclusao.error)} />}
      </form>
    </Modal>
  );
}
