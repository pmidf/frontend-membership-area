"use client";

import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

import { mascararCep, somenteDigitos } from "@/shared/lib/mascaras";
import { CampoFormulario, CampoSelecao, CampoTexto } from "@/shared/ui";

import { opcoesUf } from "./ufs";
import { useBuscarEndereco } from "./useBuscarEndereco";

export type DadosEndereco = {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
};

export type ClassesCamposEndereco = Partial<Record<keyof DadosEndereco, string>>;

type SituacaoCep = "ocioso" | "encontrado" | "nao-encontrado";

const ajudasCep: Record<SituacaoCep, string | undefined> = {
  ocioso: undefined,
  encontrado: "Endereço encontrado. Confira e complete o número.",
  "nao-encontrado": "CEP não encontrado. Preencha o endereço manualmente.",
};

export function CamposEndereco({ classes = {} }: { classes?: ClassesCamposEndereco }) {
  const {
    register,
    control,
    getValues,
    setValue,
    setFocus,
    formState: { errors },
  } = useFormContext<DadosEndereco>();
  const busca = useBuscarEndereco();
  const [situacaoCep, setSituacaoCep] = useState<SituacaoCep>("ocioso");
  const ultimoCepPreenchido = useRef(somenteDigitos(getValues("cep")));

  async function consultarCep() {
    const cep = somenteDigitos(getValues("cep"));
    if (cep.length !== 8 || cep === ultimoCepPreenchido.current) return;
    const endereco = await busca.mutateAsync(cep);
    if (somenteDigitos(getValues("cep")) !== cep) return;
    if (!endereco) {
      setSituacaoCep("nao-encontrado");
      return;
    }
    ultimoCepPreenchido.current = cep;
    const preencher = { shouldValidate: true, shouldDirty: true };
    setValue("logradouro", endereco.logradouro, preencher);
    setValue("bairro", endereco.bairro, preencher);
    setValue("cidade", endereco.cidade, preencher);
    setValue("uf", endereco.uf, preencher);
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
            className={classes.cep}
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
        className={classes.logradouro}
        erro={errors.logradouro?.message}
        {...register("logradouro")}
      />
      <CampoTexto
        rotulo="Número"
        placeholder="Nº"
        className={classes.numero}
        erro={errors.numero?.message}
        {...register("numero")}
      />
      <CampoTexto
        rotulo="Complemento"
        autoComplete="address-line2"
        placeholder="Apto, bloco, sala (opcional)"
        className={classes.complemento}
        erro={errors.complemento?.message}
        {...register("complemento")}
      />
      <CampoTexto
        rotulo="Bairro"
        className={classes.bairro}
        erro={errors.bairro?.message}
        {...register("bairro")}
      />
      <CampoTexto
        rotulo="Cidade"
        autoComplete="address-level2"
        className={classes.cidade}
        erro={errors.cidade?.message}
        {...register("cidade")}
      />
      <CampoSelecao
        rotulo="UF"
        opcoes={opcoesUf}
        textoVazio="Selecione"
        autoComplete="address-level1"
        className={classes.uf}
        erro={errors.uf?.message}
        {...register("uf")}
      />
    </>
  );
}
