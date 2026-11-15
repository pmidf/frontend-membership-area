"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import { aplicarErrosDeCampo } from "@/shared/api/aplicar-erros-de-campo";
import { ehErroApi } from "@/shared/api/erro-api";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { useAvisoAoSair } from "@/shared/hooks/useAvisoAoSair";
import { AcoesPublicacao } from "@/shared/publicacao/AcoesPublicacao";
import { CartaoPublicacao } from "@/shared/publicacao/CartaoPublicacao";
import { rotulosSituacao } from "@/shared/publicacao/situacao";
import { Botao, CabecalhoPagina, LinkVoltar, Modal, SeloStatus, useAvisos } from "@/shared/ui";

import type { BeneficioAdmin } from "../api/beneficios-admin.api";
import {
  useCriarBeneficio,
  useParceiros,
  usePublicarBeneficioCriado,
} from "../api/beneficios-admin.queries";
import { dadosParaCriar, VALORES_NOVO_BENEFICIO } from "../lib/valores-beneficio";
import { esquemaNovoBeneficio, type DadosNovoBeneficio } from "../schemas/beneficio.schema";
import { FormularioBeneficio } from "./FormularioBeneficio";
import { PreviaCardBeneficio } from "./PreviaCardBeneficio";
import { SeletorParceiro } from "./SeletorParceiro";

const CAMINHO_LISTA = "/admin/beneficios";
const ID_FORMULARIO = "formulario-beneficio";

export function PaginaNovoBeneficio() {
  const roteador = useRouter();
  const avisos = useAvisos();
  const criacao = useCriarBeneficio();
  const publicacao = usePublicarBeneficioCriado();
  const parceiros = useParceiros();
  const [acao, setAcao] = useState<"rascunho" | "publicar" | null>(null);
  const [previaAberta, setPreviaAberta] = useState(false);
  const formulario = useForm<DadosNovoBeneficio>({
    resolver: zodResolver(esquemaNovoBeneficio),
    defaultValues: VALORES_NOVO_BENEFICIO,
  });
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { isDirty, errors },
  } = formulario;
  const codParceiro = useWatch({ control, name: "cod_parceiro" });
  const nomeParceiro =
    parceiros.data?.find((parceiro) => parceiro.cod_parceiro === codParceiro)?.nome ?? "Parceiro";

  useAvisoAoSair(isDirty && acao === null);

  async function criar(dados: DadosNovoBeneficio): Promise<BeneficioAdmin | null> {
    try {
      return await criacao.mutateAsync(dadosParaCriar(dados));
    } catch (erro) {
      if (aplicarErrosDeCampo(erro, setError).length === 0) avisos.erro(mensagemDeErro(erro));
      return null;
    }
  }

  function tratarErroDaPublicacao(erro: unknown, criado: BeneficioAdmin) {
    if (ehErroApi(erro) && erro.codigo === "BENEFICIO_JA_PUBLICADO") {
      avisos.informacao(mensagemDeErro(erro));
      roteador.push(CAMINHO_LISTA);
      return;
    }
    avisos.erro(
      ehErroApi(erro) && erro.codigo === "BENEFICIO_ARQUIVADO"
        ? "Este benefício foi arquivado e não pode ser publicado."
        : "O rascunho foi salvo, mas não foi possível publicar. Tente de novo por aqui.",
    );
    roteador.push(`${CAMINHO_LISTA}/${criado.id_beneficio}`);
  }

  const salvarRascunho = handleSubmit(async (dados) => {
    if (acao) return;
    setAcao("rascunho");
    const criado = await criar(dados);
    if (!criado) return setAcao(null);
    avisos.sucesso("Rascunho salvo");
    roteador.push(`${CAMINHO_LISTA}/${criado.id_beneficio}`);
  });

  const publicar = handleSubmit(async (dados) => {
    if (acao) return;
    setAcao("publicar");
    const criado = await criar(dados);
    if (!criado) return setAcao(null);
    try {
      await publicacao.mutateAsync(criado.id_beneficio);
      avisos.sucesso("Benefício publicado");
      roteador.push(CAMINHO_LISTA);
    } catch (erro) {
      tratarErroDaPublicacao(erro, criado);
    }
  });

  return (
    <FormProvider {...formulario}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <LinkVoltar href={CAMINHO_LISTA}>Voltar para a lista de benefícios</LinkVoltar>
        <CabecalhoPagina
          titulo="Novo benefício"
          acoes={
            <SeloStatus tom={rotulosSituacao.RASCUNHO.tom}>
              {rotulosSituacao.RASCUNHO.rotulo}
            </SeloStatus>
          }
        />
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <form id={ID_FORMULARIO} noValidate onSubmit={salvarRascunho} className="min-w-0">
            <fieldset className="flex min-w-0 flex-col gap-6">
              <legend className="sr-only">Dados do benefício</legend>
              <FormularioBeneficio
                campoParceiro={
                  <SeletorParceiro
                    parceiros={parceiros.data}
                    carregando={parceiros.isPending}
                    indisponivel={parceiros.isError}
                    aoTentarNovamente={() => void parceiros.refetch()}
                    erro={errors.cod_parceiro?.message}
                    {...register("cod_parceiro")}
                  />
                }
                formaResgateTravada={false}
              />
            </fieldset>
          </form>
          <div className="flex flex-col gap-6">
            <CartaoPublicacao
              situacao="RASCUNHO"
              detalhes={[{ termo: "Visível para", valor: "Filiados ativos" }]}
              nota="Publicar torna o benefício visível na hora, respeitando a vigência. Toda edição posterior fica registrada na auditoria."
            >
              <AcoesPublicacao
                idFormulario={ID_FORMULARIO}
                acoes={["salvar", "publicar"]}
                rotuloPublicar="Publicar benefício"
                rotuloSalvar="Salvar rascunho"
                salvando={acao === "rascunho"}
                publicando={acao === "publicar"}
                aoPublicar={() => void publicar()}
              />
            </CartaoPublicacao>
            <div className="hidden lg:block">
              <PreviaCardBeneficio parceiro={nomeParceiro} />
            </div>
            <Botao
              variante="secundario"
              className="lg:hidden"
              onClick={() => setPreviaAberta(true)}
            >
              Ver como o filiado vê
            </Botao>
          </div>
        </div>
      </div>
      <Modal
        aberto={previaAberta}
        aoFechar={() => setPreviaAberta(false)}
        titulo="Prévia do card"
        descricao="Assim o benefício aparece na listagem do filiado."
      >
        <PreviaCardBeneficio parceiro={nomeParceiro} semMoldura />
      </Modal>
    </FormProvider>
  );
}
