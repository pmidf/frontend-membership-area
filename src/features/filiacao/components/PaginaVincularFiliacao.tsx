"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { aplicarErrosDeCampo } from "@/shared/api/aplicar-erros-de-campo";
import { ehErroApi } from "@/shared/api/erro-api";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import type { Perfil } from "@/shared/sessao/tipos";
import { useSessao } from "@/shared/sessao/useSessao";
import { Alerta, Botao, Cartao, CampoTexto, LinkVoltar, useAvisos } from "@/shared/ui";

import { useVincularFiliacao } from "../api/filiacao.queries";
import { CAMINHO_CODIGO_PMI, CAMINHO_SECAO_FILIACAO } from "../lib/caminhos-filiacao";
import {
  avisosVinculacao,
  MENSAGEM_FILIACAO_CONFIRMADA,
  mensagemDeEspera,
  segundosDeEspera,
  type AvisoVinculacao,
} from "../lib/mensagens-vinculacao";
import { esquemaVinculo, type DadosVinculo } from "../schemas/vinculo.schema";

const classesLink =
  "font-medium text-texto-marca underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-acao-destaque";

export function PaginaVincularFiliacao() {
  const { perfil } = useSessao();
  if (!perfil) return null;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <LinkVoltar href={CAMINHO_SECAO_FILIACAO}>Voltar para Meu perfil</LinkVoltar>
      <header className="flex flex-col gap-2">
        <h1 className="text-h2">Vincular minha filiação</h1>
        <p className="text-texto-secundario">
          Informe seu PMI ID. Vamos conferir no PMI se a sua filiação ao PMI-DF está ativa.
        </p>
      </header>
      {perfil.papeis.filiado ? <FiliacaoJaConfirmada /> : <FormularioVinculo perfil={perfil} />}
    </div>
  );
}

function FiliacaoJaConfirmada() {
  return (
    <Alerta tom="sucesso" titulo="Sua filiação já está confirmada.">
      O PMI ID de uma filiação confirmada não pode mudar. Para conferir a validade, use “Atualizar
      situação” em{" "}
      <Link href={CAMINHO_SECAO_FILIACAO} className={classesLink}>
        Meu perfil
      </Link>
      .
    </Alerta>
  );
}

function FormularioVinculo({ perfil }: { perfil: Perfil }) {
  const roteador = useRouter();
  const avisos = useAvisos();
  const vinculo = useVincularFiliacao();
  const [aviso, setAviso] = useState<AvisoVinculacao | null>(null);
  const aguardandoCodigo = perfil.filiacao?.situacao === "AGUARDANDO_CODIGO";
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DadosVinculo>({
    resolver: zodResolver(esquemaVinculo),
    defaultValues: { pmi_id: perfil.filiacao?.pmi_id ?? "" },
  });

  const enviar = handleSubmit(async ({ pmi_id }) => {
    if (vinculo.isPending) return;
    setAviso(null);
    try {
      const { resultado } = await vinculo.mutateAsync(pmi_id);
      if (resultado === "CODIGO_ENVIADO") {
        roteador.push(CAMINHO_CODIGO_PMI);
        return;
      }
      if (resultado === "APROVADO") {
        avisos.sucesso(MENSAGEM_FILIACAO_CONFIRMADA);
        roteador.replace(CAMINHO_SECAO_FILIACAO);
        return;
      }
      if (resultado) setAviso(avisosVinculacao[resultado]);
    } catch (erro) {
      const espera = segundosDeEspera(erro, "AGUARDE_PARA_ATUALIZAR");
      if (espera !== null) {
        setAviso({ tom: "erro", mensagem: mensagemDeEspera(espera) });
        return;
      }
      if (ehErroApi(erro) && aplicarErrosDeCampo(erro, setError).length > 0) return;
      setAviso({ tom: "erro", mensagem: mensagemDeErro(erro) });
    }
  });

  return (
    <>
      {aguardandoCodigo && (
        <Alerta
          tom="informacao"
          titulo="Você já tem um código pendente."
          acao={
            <Link href={CAMINHO_CODIGO_PMI} className={classesLink}>
              Digitar o código
            </Link>
          }
        >
          Enviamos um código ao e-mail cadastrado no PMI. Se informar o PMI ID de novo, enviaremos
          um código novo.
        </Alerta>
      )}
      <Cartao className="p-6">
        <form noValidate onSubmit={enviar} className="flex flex-col gap-5">
          <CampoTexto
            rotulo="PMI ID"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Ex.: 1234567"
            ajuda="Encontre em pmi.org > MyPMI > Profile (Member ID)."
            erro={errors.pmi_id?.message}
            {...register("pmi_id")}
          />
          <p className="text-corpo-pequeno text-texto-secundario">
            Se o e-mail cadastrado no PMI for diferente do e-mail desta conta, enviaremos um código
            para ele. Ao confirmar, ele passa a fazer parte da sua conta.
          </p>
          {aviso && <Alerta tom={aviso.tom} titulo={aviso.mensagem} />}
          <Botao type="submit" larguraTotal carregando={vinculo.isPending}>
            Consultar o PMI
          </Botao>
        </form>
      </Cartao>
    </>
  );
}
