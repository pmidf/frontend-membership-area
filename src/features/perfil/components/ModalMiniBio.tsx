"use client";

import { useState, type FormEvent } from "react";

import { ehErroApi } from "@/shared/api/erro-api";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { Alerta, Botao, CampoAreaTexto, Modal, useAvisos } from "@/shared/ui";

import { useAtualizarPerfil } from "../api/perfil.queries";

const ID_FORMULARIO = "formulario-mini-bio";
const TAMANHO_MAXIMO = 600;

type PropsModalMiniBio = {
  miniBio: string | null;
  aoFechar: () => void;
};

export function ModalMiniBio({ miniBio, aoFechar }: PropsModalMiniBio) {
  const avisos = useAvisos();
  const atualizacao = useAtualizarPerfil();
  const [texto, setTexto] = useState(miniBio ?? "");

  function salvar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (atualizacao.isPending) return;
    const novaMiniBio = texto.trim() || null;
    if (novaMiniBio === miniBio) {
      aoFechar();
      return;
    }
    atualizacao.mutate(
      { mini_bio: novaMiniBio },
      {
        onSuccess: () => {
          avisos.sucesso("Mini bio atualizada.");
          aoFechar();
        },
      },
    );
  }

  const erro = atualizacao.error;
  const erroCampo = ehErroApi(erro) ? erro.campos?.mini_bio?.[0] : undefined;

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo="Editar mini bio"
      rodape={
        <>
          <Botao variante="secundario" onClick={aoFechar} disabled={atualizacao.isPending}>
            Cancelar
          </Botao>
          <Botao type="submit" form={ID_FORMULARIO} carregando={atualizacao.isPending}>
            Salvar
          </Botao>
        </>
      }
    >
      <form id={ID_FORMULARIO} noValidate onSubmit={salvar} className="flex flex-col gap-4">
        <CampoAreaTexto
          rotulo="Mini bio"
          value={texto}
          maxLength={TAMANHO_MAXIMO}
          rows={6}
          data-foco-inicial
          erro={erroCampo}
          onChange={(evento) => setTexto(evento.target.value)}
        />
        {erro && !erroCampo && <Alerta tom="erro" titulo={mensagemDeErro(erro)} />}
      </form>
    </Modal>
  );
}
