"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { useAvisoAoSair } from "@/shared/hooks/useAvisoAoSair";
import { AcoesPublicacao } from "@/shared/publicacao/AcoesPublicacao";
import { CartaoPublicacao } from "@/shared/publicacao/CartaoPublicacao";
import { useAvisos } from "@/shared/ui";

import { useCriarTrilha, usePublicarTrilha } from "../api/trilhas-admin.queries";
import {
  aplicarErrosDaTrilha,
  CAMINHO_LISTA_TRILHAS,
  caminhoTrilha,
  dadosParaCriarTrilha,
  MENSAGEM_SEM_PUBLICADO,
  motivoDaFalhaAoPublicar,
  temConteudoPublicado,
  VALORES_NOVA_TRILHA,
} from "../lib/valores-trilha";
import { esquemaTrilha, type DadosTrilha } from "../schemas/trilha.schema";
import type { TrilhaAdmin } from "../tipos/trilha-admin";
import { EstruturaFormularioTrilha, ID_FORMULARIO_TRILHA } from "./EstruturaFormularioTrilha";

export function PaginaNovaTrilha() {
  const roteador = useRouter();
  const avisos = useAvisos();
  const criacao = useCriarTrilha();
  const publicacao = usePublicarTrilha();
  const [acao, setAcao] = useState<"rascunho" | "publicar" | null>(null);
  const formulario = useForm<DadosTrilha>({
    resolver: zodResolver(esquemaTrilha),
    defaultValues: VALORES_NOVA_TRILHA,
  });
  const {
    handleSubmit,
    setError,
    formState: { isDirty },
  } = formulario;

  useAvisoAoSair(isDirty && acao === null);

  async function criar(dados: DadosTrilha): Promise<TrilhaAdmin | null> {
    try {
      return await criacao.mutateAsync(dadosParaCriarTrilha(dados));
    } catch (erro) {
      if (!aplicarErrosDaTrilha(erro, setError)) avisos.erro(mensagemDeErro(erro));
      return null;
    }
  }

  const salvarRascunho = handleSubmit(async (dados) => {
    if (acao) return;
    setAcao("rascunho");
    const criada = await criar(dados);
    if (!criada) return setAcao(null);
    avisos.sucesso("Rascunho salvo");
    roteador.push(caminhoTrilha(criada.id_trilha));
  });

  const publicar = handleSubmit(async (dados) => {
    if (acao) return;
    if (!temConteudoPublicado(dados.itens)) {
      setError("itens", { type: "regra", message: MENSAGEM_SEM_PUBLICADO });
      return;
    }
    setAcao("publicar");
    const criada = await criar(dados);
    if (!criada) return setAcao(null);
    try {
      await publicacao.mutateAsync(criada.id_trilha);
      avisos.sucesso("Trilha publicada");
      roteador.push(CAMINHO_LISTA_TRILHAS);
    } catch (erro) {
      avisos.erro(
        `O rascunho foi salvo, mas não foi possível publicar. ${motivoDaFalhaAoPublicar(erro)}`,
      );
      roteador.push(caminhoTrilha(criada.id_trilha));
    }
  });

  return (
    <FormProvider {...formulario}>
      <EstruturaFormularioTrilha
        titulo="Nova trilha de conhecimento"
        destinoVolta={CAMINHO_LISTA_TRILHAS}
        aoEnviar={salvarRascunho}
        lateral={
          <CartaoPublicacao
            situacao="RASCUNHO"
            nota="A trilha só aparece no catálogo depois de publicada e com ao menos um conteúdo publicado."
          >
            <AcoesPublicacao
              idFormulario={ID_FORMULARIO_TRILHA}
              acoes={["salvar", "publicar"]}
              rotuloPublicar="Publicar trilha"
              rotuloSalvar="Salvar rascunho"
              salvando={acao === "rascunho"}
              publicando={acao === "publicar"}
              aoPublicar={() => void publicar()}
            />
          </CartaoPublicacao>
        }
      />
    </FormProvider>
  );
}
