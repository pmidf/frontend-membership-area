"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { aplicarErrosDeCampo } from "@/shared/api/aplicar-erros-de-campo";
import { ehErroApi } from "@/shared/api/erro-api";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { Alerta, Botao, CampoSenha, Esqueleto, useAvisos } from "@/shared/ui";

import { useRedefinirSenha, useValidacaoToken } from "../../api/senha.queries";
import { normalizarToken } from "../../lib/token-senha";
import { esquemaNovaSenha, type DadosNovaSenha } from "../../schemas/senha.schema";
import { IndicadorForcaSenha } from "./IndicadorForcaSenha";
import { LinkInvalido } from "./LinkInvalido";

export const AVISO_SENHA_ALTERADA = "Senha alterada. Entre com a nova senha.";

type PropsFormularioNovaSenha = {
  token: string;
  aoTokenInvalido: () => void;
};

export function FormularioNovaSenha({ token, aoTokenInvalido }: PropsFormularioNovaSenha) {
  const roteador = useRouter();
  const avisos = useAvisos();
  const redefinicao = useRedefinirSenha();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<DadosNovaSenha>({
    resolver: zodResolver(esquemaNovaSenha),
    defaultValues: { nova_senha: "", confirmacao: "" },
  });
  const novaSenha = useWatch({ control, name: "nova_senha" });

  const salvar = handleSubmit(async ({ nova_senha }) => {
    if (redefinicao.isPending) return;
    try {
      await redefinicao.mutateAsync({ token, nova_senha });
      avisos.sucesso(AVISO_SENHA_ALTERADA);
      roteador.replace("/login");
    } catch (erro) {
      if (!ehErroApi(erro)) return;
      if (erro.codigo === "TOKEN_INVALIDO" || erro.campos?.token) aoTokenInvalido();
      else aplicarErrosDeCampo(erro, setError);
    }
  });

  const erroGeral =
    redefinicao.error && !(ehErroApi(redefinicao.error) && redefinicao.error.status === 422)
      ? mensagemDeErro(redefinicao.error)
      : null;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-h2">Crie uma nova senha</h1>
        <p className="text-texto-secundario">
          Use pelo menos 10 caracteres. Evite senhas já usadas em outros sites.
        </p>
      </header>
      <form noValidate onSubmit={salvar} className="flex flex-col gap-5">
        <CampoSenha
          rotulo="Nova senha"
          autoComplete="new-password"
          ajuda={<IndicadorForcaSenha senha={novaSenha} />}
          erro={errors.nova_senha?.message}
          {...register("nova_senha")}
        />
        <CampoSenha
          rotulo="Confirmar nova senha"
          autoComplete="new-password"
          erro={errors.confirmacao?.message}
          {...register("confirmacao")}
        />
        <Alerta tom="alerta" titulo="Ao salvar, todas as suas sessões serão encerradas">
          Você precisará entrar de novo em todos os dispositivos.
        </Alerta>
        {erroGeral && <Alerta tom="erro" titulo={erroGeral} />}
        <Botao type="submit" larguraTotal carregando={redefinicao.isPending}>
          Salvar nova senha
        </Botao>
      </form>
    </div>
  );
}

export function RedefinicaoSenha({ token }: { token: string }) {
  const validacao = useValidacaoToken(token);
  const [tokenExpirou, setTokenExpirou] = useState(false);

  if (!token || tokenExpirou || validacao.isError || validacao.data?.valido === false) {
    return <LinkInvalido />;
  }
  if (validacao.isPending) {
    return <Esqueleto variante="cartao" rotulo="Validando o link…" />;
  }
  return <FormularioNovaSenha token={token} aoTokenInvalido={() => setTokenExpirou(true)} />;
}

export function RedefinicaoSenhaPelaUrl() {
  return <RedefinicaoSenha token={normalizarToken(useSearchParams().get("token"))} />;
}
