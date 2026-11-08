"use client";

import { useFormContext } from "react-hook-form";

import { mascararTelefone } from "@/shared/lib/mascaras";
import { Alerta, CampoFormulario, CampoSelecao, CampoTexto } from "@/shared/ui";

import { opcoesEscolaridade, opcoesGenero } from "../../lib/opcoes-cadastro";
import type { DadosCadastro } from "../../schemas/cadastro.schema";

export function PassoPessoal({ filiacaoEncontrada }: { filiacaoEncontrada: boolean }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<DadosCadastro>();

  return (
    <>
      {filiacaoEncontrada && (
        <Alerta tom="sucesso" titulo="Encontramos sua filiação no PMI-DF.">
          Seu nome foi preenchido a partir do cadastro do PMI.
        </Alerta>
      )}
      <CampoFormulario
        nome="telefone"
        controle={control}
        renderizar={({ nome, valor, aoMudar, aoSair, ref, erro }) => (
          <CampoTexto
            rotulo="Telefone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="(61) 9 9999-9999"
            name={nome}
            value={valor}
            onChange={(evento) => aoMudar(mascararTelefone(evento.target.value))}
            onBlur={aoSair}
            ref={ref}
            erro={erro}
          />
        )}
      />
      <CampoTexto
        rotulo="Data de nascimento"
        type="date"
        autoComplete="bday"
        ajuda="É preciso ter 18 anos ou mais para criar conta."
        erro={errors.data_nascimento?.message}
        {...register("data_nascimento")}
      />
      <CampoSelecao
        rotulo="Gênero"
        opcoes={opcoesGenero}
        textoVazio="Selecione"
        ajuda='Inclui a opção "Prefiro não informar".'
        erro={errors.genero?.message}
        {...register("genero")}
      />
      <CampoSelecao
        rotulo="Escolaridade"
        opcoes={opcoesEscolaridade}
        textoVazio="Selecione"
        erro={errors.escolaridade?.message}
        {...register("escolaridade")}
      />
    </>
  );
}
