"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { aplicarErrosDeCampo } from "@/shared/api/aplicar-erros-de-campo";
import { ehErroApi } from "@/shared/api/erro-api";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { destinoDaUrlAtual } from "@/shared/sessao/destino-seguro";
import { useSessao } from "@/shared/sessao/useSessao";
import { Alerta, Botao, CampoSenha, CampoTexto, useAvisos } from "@/shared/ui";

import { useEntrar } from "../api/auth.queries";
import { esquemaLogin, type DadosFormularioLogin } from "../schemas/login.schema";

const CODIGOS_SEM_NOVA_TENTATIVA = new Set(["CREDENCIAIS_INVALIDAS", "CONTA_SUSPENSA"]);
const CODIGOS_SEM_ALERTA = new Set(["EMAIL_NAO_CONFIRMADO", "DADOS_INVALIDOS"]);

type AlertaLogin = { mensagem: string; permiteNovaTentativa: boolean };

function alertaDoErro(erro: unknown): AlertaLogin | null {
  if (!erro) return null;
  const codigo = ehErroApi(erro) ? erro.codigo : "";
  if (CODIGOS_SEM_ALERTA.has(codigo)) return null;
  return {
    mensagem: mensagemDeErro(erro),
    permiteNovaTentativa: !CODIGOS_SEM_NOVA_TENTATIVA.has(codigo),
  };
}

export function caminhoDeConfirmacao(email: string): string {
  return `/confirmar-email?email=${encodeURIComponent(email)}`;
}

export function FormularioLogin() {
  const roteador = useRouter();
  const sessao = useSessao();
  const avisos = useAvisos();
  const login = useEntrar();
  const {
    register,
    handleSubmit,
    setError,
    resetField,
    formState: { errors },
  } = useForm<DadosFormularioLogin>({
    resolver: zodResolver(esquemaLogin),
    defaultValues: { email: "", senha: "" },
  });

  function tratarErro(erro: unknown, dados: DadosFormularioLogin) {
    if (!ehErroApi(erro)) return;
    if (erro.codigo === "CREDENCIAIS_INVALIDAS") resetField("senha");
    if (erro.codigo === "EMAIL_NAO_CONFIRMADO") {
      avisos.informacao("Confirme seu e-mail para entrar.");
      roteador.push(caminhoDeConfirmacao(dados.email));
    }
    aplicarErrosDeCampo(erro, setError);
  }

  const enviar = handleSubmit(async (dados) => {
    if (login.isPending) return;
    try {
      await sessao.entrar(await login.mutateAsync(dados));
      roteador.replace(destinoDaUrlAtual());
    } catch (erro) {
      tratarErro(erro, dados);
    }
  });

  const alerta = alertaDoErro(login.error);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-h2">Bem-vindo de volta</h1>
        <p className="text-texto-secundario">Acesse a área de membros do PMI-DF.</p>
      </header>

      <form noValidate onSubmit={enviar} className="flex flex-col gap-5">
        <CampoTexto
          rotulo="E-mail"
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          erro={errors.email?.message}
          {...register("email")}
        />
        <div className="flex flex-col gap-3">
          <CampoSenha
            rotulo="Senha"
            autoComplete="current-password"
            erro={errors.senha?.message}
            {...register("senha")}
          />
          <Link
            href="/esqueci-senha"
            className="self-end text-corpo-pequeno font-medium text-texto-marca underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-acao-destaque"
          >
            Esqueci minha senha
          </Link>
        </div>

        {alerta && (
          <Alerta
            tom="erro"
            titulo={alerta.mensagem}
            acao={
              alerta.permiteNovaTentativa && (
                <Botao type="button" variante="link" onClick={() => void enviar()}>
                  Tentar novamente
                </Botao>
              )
            }
          />
        )}

        <Botao type="submit" larguraTotal carregando={login.isPending}>
          Entrar
        </Botao>
      </form>

      <div className="flex items-center gap-4 text-legenda text-texto-secundario">
        <span aria-hidden="true" className="h-px flex-1 bg-borda-padrao" />
        ou
        <span aria-hidden="true" className="h-px flex-1 bg-borda-padrao" />
      </div>

      <p className="text-center text-corpo-pequeno text-texto-secundario">
        Ainda não tem conta?{" "}
        <Link
          href="/cadastro"
          className="font-medium text-texto-marca underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-acao-destaque"
        >
          Cadastre-se gratuitamente
        </Link>
      </p>
    </div>
  );
}
