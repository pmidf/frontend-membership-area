"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";

import { mascararCep, somenteDigitos } from "@/shared/lib/mascaras";
import { CampoFormulario, CampoSelecao, CampoTexto } from "@/shared/ui";

import { useBuscarEndereco } from "../../api/auth.queries";
import { opcoesUf } from "../../lib/opcoes-cadastro";
import type { DadosCadastro } from "../../schemas/cadastro.schema";

type SituacaoCep = "ocioso" | "encontrado" | "nao-encontrado";

const ajudasCep: Record<SituacaoCep, string | undefined> = {
  ocioso: undefined,
  encontrado: "Endereço encontrado. Confira e complete o número.",
  "nao-encontrado": "CEP não encontrado. Preencha o endereço manualmente.",
};

export function PassoEndereco() {
  const {
    register,
    control,
    getValues,
    setValue,
    setFocus,
    formState: { errors },
  } = useFormContext<DadosCadastro>();
  const busca = useBuscarEndereco();
  const [situacaoCep, setSituacaoCep] = useState<SituacaoCep>("ocioso");

  async function consultarCep() {
    const cep = somenteDigitos(getValues("cep"));
    if (cep.length !== 8) return;
    const endereco = await busca.mutateAsync(cep);
    if (somenteDigitos(getValues("cep")) !== cep) return;
    if (!endereco) {
      setSituacaoCep("nao-encontrado");
      return;
    }
    const preencher = { shouldValidate: true, shouldDirty: true };
    setValue("logradouro", endereco.logradouro, preencher);
    setValue("bairro", endereco.bairro, preencher);
    setValue("cidade", endereco.cidade, preencher);
    setValue("uf", endereco.uf as DadosCadastro["uf"], preencher);
    setSituacaoCep("encontrado");
    setFocus("numero");
  }

  return (
    <>
      <CampoFormulario
        nome="cep"
        controle={control}
        renderizar={({ nome, valor, aoMudar, aoSair, ref, erro }) => (
          <CampoTexto
            rotulo="CEP"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="00000-000"
            name={nome}
            value={valor}
            onChange={(evento) => aoMudar(mascararCep(evento.target.value))}
            onBlur={() => {
              aoSair();
              void consultarCep();
            }}
            ref={ref}
            ajuda={busca.isPending ? "Buscando endereço…" : ajudasCep[situacaoCep]}
            erro={erro}
          />
        )}
      />
      <CampoTexto
        rotulo="Logradouro"
        autoComplete="address-line1"
        erro={errors.logradouro?.message}
        {...register("logradouro")}
      />
      <CampoTexto
        rotulo="Número"
        placeholder="Nº"
        erro={errors.numero?.message}
        {...register("numero")}
      />
      <CampoTexto
        rotulo="Complemento"
        autoComplete="address-line2"
        placeholder="Apto, bloco, sala (opcional)"
        erro={errors.complemento?.message}
        {...register("complemento")}
      />
      <CampoTexto rotulo="Bairro" erro={errors.bairro?.message} {...register("bairro")} />
      <CampoTexto
        rotulo="Cidade"
        autoComplete="address-level2"
        erro={errors.cidade?.message}
        {...register("cidade")}
      />
      <CampoSelecao
        rotulo="UF"
        opcoes={opcoesUf}
        textoVazio="Selecione"
        autoComplete="address-level1"
        erro={errors.uf?.message}
        {...register("uf")}
      />
    </>
  );
}
