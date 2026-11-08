"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { useContagemRegressiva } from "@/shared/hooks/useContagemRegressiva";
import { Alerta, Botao, CampoTexto, useAvisos } from "@/shared/ui";
import { classesBotao } from "@/shared/ui/botao/Botao";

import { useSolicitarRecuperacao } from "../../api/senha.queries";
import {
  esquemaEsqueciSenha,
  type DadosEsqueciSenha,
} from "../../schemas/recuperacao-senha.schema";

export const INTERVALO_REENVIO_INSTRUCOES = 60;

const classesLink =
  "font-medium text-texto-marca underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-acao-destaque";

type PropsInstrucoesEnviadas = {
  email: string;
  aoEnviarDeNovo: () => Promise<boolean>;
  enviando: boolean;
};

export function InstrucoesEnviadas({ email, aoEnviarDeNovo, enviando }: PropsInstrucoesEnviadas) {
  const contagem = useContagemRegressiva(INTERVALO_REENVIO_INSTRUCOES);

  async function enviarDeNovo() {
    if (await aoEnviarDeNovo()) contagem.reiniciar(INTERVALO_REENVIO_INSTRUCOES);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-h2">Verifique seu e-mail</h1>
        <p className="text-texto-secundario">
          Se <strong className="font-medium wrap-anywhere text-texto-primario">{email}</strong>{" "}
          estiver cadastrado, você receberá um link para criar uma nova senha. O link vale por 60
          minutos.
        </p>
      </header>
      <div className="flex flex-col gap-3">
        <Botao
          type="button"
          variante="secundario"
          larguraTotal
          disabled={contagem.ativa}
          carregando={enviando}
          onClick={() => void enviarDeNovo()}
        >
          {contagem.ativa ? `Enviar de novo (disponível em ${contagem.rotulo})` : "Enviar de novo"}
        </Botao>
        <Link href="/login" className={classesBotao({ larguraTotal: true })}>
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}

export function EsqueciSenha() {
  const solicitacao = useSolicitarRecuperacao();
  const avisos = useAvisos();
  const [emailEnviado, setEmailEnviado] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DadosEsqueciSenha>({
    resolver: zodResolver(esquemaEsqueciSenha),
    defaultValues: { email: "" },
  });

  async function solicitar(email: string): Promise<boolean> {
    try {
      await solicitacao.mutateAsync(email);
      return true;
    } catch {
      return false;
    }
  }

  async function enviarDeNovo(): Promise<boolean> {
    if (!emailEnviado) return false;
    try {
      await solicitacao.mutateAsync(emailEnviado);
      avisos.sucesso("Enviamos as instruções de novo.");
      return true;
    } catch (erro) {
      avisos.erro(mensagemDeErro(erro));
      return false;
    }
  }

  if (emailEnviado) {
    return (
      <InstrucoesEnviadas
        email={emailEnviado}
        aoEnviarDeNovo={enviarDeNovo}
        enviando={solicitacao.isPending}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-h2">Esqueceu a senha?</h1>
        <p className="text-texto-secundario">
          Informe o e-mail da sua conta. Se ele estiver cadastrado, enviaremos as instruções para
          criar uma nova senha.
        </p>
      </header>
      <form
        noValidate
        onSubmit={handleSubmit(async ({ email }) => {
          if (solicitacao.isPending) return;
          if (await solicitar(email)) setEmailEnviado(email);
        })}
        className="flex flex-col gap-5"
      >
        <CampoTexto
          rotulo="E-mail"
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          erro={errors.email?.message}
          {...register("email")}
        />
        {solicitacao.error && <Alerta tom="erro" titulo={mensagemDeErro(solicitacao.error)} />}
        <Botao type="submit" larguraTotal carregando={solicitacao.isPending}>
          Enviar instruções
        </Botao>
      </form>
      <p className="text-center text-corpo-pequeno text-texto-secundario">
        Lembrou a senha?{" "}
        <Link href="/login" className={classesLink}>
          Entrar
        </Link>
      </p>
    </div>
  );
}
