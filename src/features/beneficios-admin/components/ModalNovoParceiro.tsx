"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { aplicarErrosDeCampo } from "@/shared/api/aplicar-erros-de-campo";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { Botao, CampoAreaTexto, CampoTexto, Modal, useAvisos } from "@/shared/ui";

import type { Parceiro } from "../api/beneficios-admin.api";
import { parceiroJaExiste, useCriarParceiro } from "../api/beneficios-admin.queries";
import {
  dadosParaCriarParceiro,
  esquemaNovoParceiro,
  TAMANHO_MAXIMO_NOME_PARCEIRO,
  VALORES_NOVO_PARCEIRO,
  type DadosNovoParceiro,
} from "../schemas/parceiro.schema";

const ID_FORMULARIO = "formulario-novo-parceiro";

type PropsModalNovoParceiro = {
  aberto: boolean;
  aoFechar: () => void;
  aoCriar: (parceiro: Parceiro) => void;
};

export function ModalNovoParceiro({ aberto, ...props }: PropsModalNovoParceiro) {
  if (!aberto) return null;
  return <ConteudoModalNovoParceiro {...props} />;
}

function ConteudoModalNovoParceiro({ aoFechar, aoCriar }: Omit<PropsModalNovoParceiro, "aberto">) {
  const avisos = useAvisos();
  const criacao = useCriarParceiro();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DadosNovoParceiro, unknown, z.output<typeof esquemaNovoParceiro>>({
    resolver: zodResolver(esquemaNovoParceiro),
    defaultValues: VALORES_NOVO_PARCEIRO,
  });

  const salvar = handleSubmit(async (dados) => {
    try {
      const criado = await criacao.mutateAsync(dadosParaCriarParceiro(dados));
      avisos.sucesso(`Parceiro ${criado.nome} cadastrado`);
      aoCriar(criado);
    } catch (erro) {
      if (parceiroJaExiste(erro)) {
        setError(
          "nome",
          { type: "servidor", message: mensagemDeErro(erro) },
          { shouldFocus: true },
        );
        return;
      }
      if (aplicarErrosDeCampo(erro, setError).length === 0) avisos.erro(mensagemDeErro(erro));
    }
  });

  const fechar = () => {
    if (!criacao.isPending) aoFechar();
  };

  return (
    <Modal
      aberto
      aoFechar={fechar}
      titulo="Novo parceiro"
      descricao="O parceiro fica disponível para todos os benefícios."
      fecharAoClicarFora={false}
      rodape={
        <>
          <Botao type="button" variante="secundario" onClick={fechar}>
            Cancelar
          </Botao>
          <Botao type="submit" form={ID_FORMULARIO} carregando={criacao.isPending}>
            Salvar parceiro
          </Botao>
        </>
      }
    >
      <form
        id={ID_FORMULARIO}
        noValidate
        onSubmit={(evento) => {
          evento.stopPropagation();
          void salvar(evento);
        }}
        className="flex flex-col gap-4"
      >
        <CampoTexto
          rotulo="Nome do parceiro"
          maxLength={TAMANHO_MAXIMO_NOME_PARCEIRO}
          ajuda="Precisa ser único."
          erro={errors.nome?.message}
          data-foco-inicial
          {...register("nome")}
        />
        <CampoAreaTexto
          rotulo="Descrição (opcional)"
          rows={3}
          erro={errors.descricao?.message}
          {...register("descricao")}
        />
        <CampoTexto
          rotulo="Site (opcional)"
          type="url"
          inputMode="url"
          placeholder="https://"
          erro={errors.site_url?.message}
          {...register("site_url")}
        />
      </form>
    </Modal>
  );
}
