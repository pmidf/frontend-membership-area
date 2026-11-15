"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { aplicarErrosDeCampo } from "@/shared/api/aplicar-erros-de-campo";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { useAvisoAoSair } from "@/shared/hooks/useAvisoAoSair";
import { CartaoPublicacao } from "@/shared/publicacao/CartaoPublicacao";
import { useAvisos } from "@/shared/ui";

import { useCriarOportunidade, usePublicarOportunidade } from "../api/oportunidades-admin.queries";
import { dadosParaEnviar, VALORES_NOVA_OPORTUNIDADE } from "../lib/valores-oportunidade";
import { esquemaOportunidade, type DadosOportunidade } from "../schemas/oportunidade.schema";
import type { OportunidadeAdmin } from "../tipos/oportunidade-admin";
import { AcoesRascunho, type AcaoRascunho } from "./AcoesRascunho";
import {
  CAMINHO_VAGAS_ADMIN,
  EstruturaFormularioOportunidade,
  PARAMETRO_PREVIA,
} from "./EstruturaFormularioOportunidade";

export function PaginaNovaOportunidade() {
  const roteador = useRouter();
  const avisos = useAvisos();
  const criacao = useCriarOportunidade();
  const publicacao = usePublicarOportunidade();
  const [acao, setAcao] = useState<AcaoRascunho | null>(null);
  const formulario = useForm<DadosOportunidade>({
    resolver: zodResolver(esquemaOportunidade),
    defaultValues: VALORES_NOVA_OPORTUNIDADE,
  });
  const {
    handleSubmit,
    setError,
    formState: { isDirty },
  } = formulario;

  useAvisoAoSair(isDirty && acao === null);

  async function criar(dados: DadosOportunidade): Promise<OportunidadeAdmin | null> {
    try {
      return await criacao.mutateAsync(dadosParaEnviar(dados));
    } catch (erro) {
      if (aplicarErrosDeCampo(erro, setError).length === 0) avisos.erro(mensagemDeErro(erro));
      return null;
    }
  }

  function criarEIr(acaoEscolhida: "salvar" | "previsualizar") {
    return handleSubmit(async (dados) => {
      if (acao) return;
      setAcao(acaoEscolhida);
      const criada = await criar(dados);
      if (!criada) return setAcao(null);
      avisos.sucesso("Rascunho salvo");
      const destino = `${CAMINHO_VAGAS_ADMIN}/${criada.id_oportunidade}`;
      roteador.push(
        acaoEscolhida === "previsualizar" ? `${destino}?${PARAMETRO_PREVIA}=1` : destino,
      );
    });
  }

  const publicar = handleSubmit(async (dados) => {
    if (acao) return;
    setAcao("publicar");
    const criada = await criar(dados);
    if (!criada) return setAcao(null);
    try {
      await publicacao.mutateAsync(criada.id_oportunidade);
      avisos.sucesso("Vaga publicada");
      roteador.push(CAMINHO_VAGAS_ADMIN);
    } catch (erro) {
      avisos.erro(`O rascunho foi salvo, mas a vaga não foi publicada. ${mensagemDeErro(erro)}`);
      roteador.push(`${CAMINHO_VAGAS_ADMIN}/${criada.id_oportunidade}`);
    }
  });

  return (
    <FormProvider {...formulario}>
      <EstruturaFormularioOportunidade
        titulo="Nova vaga"
        aoEnviar={criarEIr("salvar")}
        lateral={
          <CartaoPublicacao
            situacao="RASCUNHO"
            nota="Publicar coloca a vaga na vitrine na hora. Pré-visualizar salva antes o rascunho."
          >
            <AcoesRascunho
              emAndamento={acao}
              aoPrevisualizar={() => void criarEIr("previsualizar")()}
              aoPublicar={() => void publicar()}
            />
          </CartaoPublicacao>
        }
      />
    </FormProvider>
  );
}
