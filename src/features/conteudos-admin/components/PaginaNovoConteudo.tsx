"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { aplicarErrosDeCampo } from "@/shared/api/aplicar-erros-de-campo";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { useAvisoAoSair } from "@/shared/hooks/useAvisoAoSair";
import { AcoesPublicacao } from "@/shared/publicacao/AcoesPublicacao";
import { CartaoPublicacao } from "@/shared/publicacao/CartaoPublicacao";
import { useAvisos } from "@/shared/ui";

import { useCriarConteudo, usePublicarConteudo } from "../api/conteudos-admin.queries";
import { dadosParaCriar, VALORES_NOVO_CONTEUDO } from "../lib/valores-conteudo";
import { esquemaConteudo, type DadosConteudo } from "../schemas/conteudo.schema";
import type { ConteudoAdmin } from "../tipos/conteudo-admin";
import { EstruturaFormularioConteudo, ID_FORMULARIO_CONTEUDO } from "./EstruturaFormularioConteudo";

const CAMINHO_BIBLIOTECA = "/admin/conteudos";

export function PaginaNovoConteudo() {
  const roteador = useRouter();
  const avisos = useAvisos();
  const criacao = useCriarConteudo();
  const publicacao = usePublicarConteudo();
  const [acao, setAcao] = useState<"rascunho" | "publicar" | null>(null);
  const formulario = useForm<DadosConteudo>({
    resolver: zodResolver(esquemaConteudo),
    defaultValues: VALORES_NOVO_CONTEUDO,
  });
  const {
    handleSubmit,
    setError,
    formState: { isDirty },
  } = formulario;

  useAvisoAoSair(isDirty && acao === null);

  async function criar(dados: DadosConteudo): Promise<ConteudoAdmin | null> {
    try {
      return await criacao.mutateAsync(dadosParaCriar(dados));
    } catch (erro) {
      if (aplicarErrosDeCampo(erro, setError).length === 0) avisos.erro(mensagemDeErro(erro));
      return null;
    }
  }

  const salvarRascunho = handleSubmit(async (dados) => {
    if (acao) return;
    setAcao("rascunho");
    const criado = await criar(dados);
    if (!criado) return setAcao(null);
    avisos.sucesso("Rascunho salvo");
    roteador.push(`${CAMINHO_BIBLIOTECA}/${criado.id_conteudo}`);
  });

  const publicar = handleSubmit(async (dados) => {
    if (acao) return;
    setAcao("publicar");
    const criado = await criar(dados);
    if (!criado) return setAcao(null);
    try {
      await publicacao.mutateAsync(criado.id_conteudo);
      avisos.sucesso("Conteúdo publicado");
      roteador.push(CAMINHO_BIBLIOTECA);
    } catch {
      avisos.erro("O rascunho foi salvo, mas não foi possível publicar. Tente de novo por aqui.");
      roteador.push(`${CAMINHO_BIBLIOTECA}/${criado.id_conteudo}`);
    }
  });

  return (
    <FormProvider {...formulario}>
      <EstruturaFormularioConteudo
        titulo="Novo conteúdo"
        destinoVolta={CAMINHO_BIBLIOTECA}
        aoEnviar={salvarRascunho}
        lateral={
          <CartaoPublicacao
            situacao="RASCUNHO"
            nota="Publicar coloca o conteúdo no catálogo na hora. O rascunho só aparece aqui no console."
          >
            <AcoesPublicacao
              idFormulario={ID_FORMULARIO_CONTEUDO}
              acoes={["salvar", "publicar"]}
              rotuloPublicar="Publicar conteúdo"
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
