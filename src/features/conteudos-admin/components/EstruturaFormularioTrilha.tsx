"use client";

import { useState, type FormEventHandler, type ReactNode } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { CabecalhoPagina, CampoAreaTexto, CampoTexto, Cartao, LinkVoltar } from "@/shared/ui";

import type { DadosTrilha } from "../schemas/trilha.schema";
import { CartaoPreviaTrilha } from "./CartaoPreviaTrilha";
import { ItensTrilha } from "./ItensTrilha";
import { ModalAdicionarConteudos } from "./ModalAdicionarConteudos";

export const ID_FORMULARIO_TRILHA = "formulario-trilha";

function InformacoesTrilha() {
  const {
    register,
    formState: { errors },
  } = useFormContext<DadosTrilha>();
  return (
    <Cartao className="flex flex-col gap-5 p-6">
      <h2 className="text-h3">Informações da trilha</h2>
      <CampoTexto
        rotulo="Título da trilha"
        maxLength={150}
        placeholder="Ex.: Fundamentos de Gestão de Riscos"
        erro={errors.titulo?.message}
        {...register("titulo")}
      />
      <CampoAreaTexto
        rotulo="Descrição"
        rows={3}
        placeholder="Para quem é a trilha e o que a pessoa aprende ao concluir."
        erro={errors.descricao?.message}
        {...register("descricao")}
      />
    </Cartao>
  );
}

type PropsEstrutura = {
  titulo: string;
  destinoVolta: string;
  acoesCabecalho?: ReactNode;
  aoEnviar: FormEventHandler<HTMLFormElement>;
  bloqueado?: boolean;
  lateral: ReactNode;
};

export function EstruturaFormularioTrilha({
  titulo,
  destinoVolta,
  acoesCabecalho,
  aoEnviar,
  bloqueado = false,
  lateral,
}: PropsEstrutura) {
  const { control, clearErrors } = useFormContext<DadosTrilha>();
  const itens = useFieldArray({ control, name: "itens", keyName: "chave" });
  const [adicionando, setAdicionando] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <LinkVoltar href={destinoVolta}>Voltar para as trilhas</LinkVoltar>
      <CabecalhoPagina titulo={titulo} acoes={acoesCabecalho} />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <form id={ID_FORMULARIO_TRILHA} noValidate onSubmit={aoEnviar} className="min-w-0">
          <fieldset disabled={bloqueado} className="flex min-w-0 flex-col gap-6">
            <legend className="sr-only">Dados da trilha</legend>
            <InformacoesTrilha />
            <ItensTrilha itens={itens} aoAdicionar={() => setAdicionando(true)} />
          </fieldset>
        </form>
        <div className="flex flex-col gap-6">
          {lateral}
          <CartaoPreviaTrilha />
        </div>
      </div>
      <ModalAdicionarConteudos
        aberto={adicionando}
        aoFechar={() => setAdicionando(false)}
        selecionados={itens.fields.map(({ id_conteudo }) => id_conteudo)}
        aoAdicionar={(item) => {
          itens.append(item, { shouldFocus: false });
          clearErrors("itens");
        }}
      />
    </div>
  );
}
