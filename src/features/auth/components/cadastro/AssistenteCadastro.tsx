"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { FormProvider, useForm } from "react-hook-form";

import { aplicarErrosDeCampo } from "@/shared/api/aplicar-erros-de-campo";
import { ehErroApi } from "@/shared/api/erro-api";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { Alerta, Botao, IndicadorEtapas } from "@/shared/ui";

import { useCadastrar, usePreCadastro } from "../../api/auth.queries";
import { caminhoDeConfirmacao } from "../../lib/caminhos";
import { montarCadastro } from "../../lib/montar-cadastro";
import {
  camposPorPasso,
  esquemaCadastro,
  passoDoCampo,
  valoresIniciaisCadastro,
  type DadosCadastro,
} from "../../schemas/cadastro.schema";
import { PassoAcesso } from "./PassoAcesso";
import { PassoEndereco } from "./PassoEndereco";
import { PassoPessoal } from "./PassoPessoal";
import { PassoProfissional } from "./PassoProfissional";

const passos = [
  {
    rotulo: "Dados de acesso",
    titulo: "Criar sua conta",
    subtitulo: "Leva menos de dois minutos. Pedimos só o essencial agora.",
  },
  {
    rotulo: "Dados pessoais",
    titulo: "Sobre você",
    subtitulo: "Esses dados ficam no seu perfil e podem ser editados depois.",
  },
  {
    rotulo: "Endereço",
    titulo: "Onde você mora",
    subtitulo: "Digite o CEP e completamos o endereço para você.",
  },
  {
    rotulo: "Profissional",
    titulo: "Sua atuação",
    subtitulo:
      "Só o LinkedIn é opcional. Esses dados podem aparecer na vitrine se você quiser, mais tarde.",
  },
];

const ULTIMO_PASSO = passos.length - 1;

export function AssistenteCadastro() {
  const roteador = useRouter();
  const formulario = useForm<DadosCadastro>({
    resolver: zodResolver(esquemaCadastro),
    defaultValues: valoresIniciaisCadastro,
  });
  const { trigger, getValues, setValue, setError, setFocus } = formulario;
  const preCadastro = usePreCadastro();
  const cadastro = useCadastrar();
  const [passo, setPasso] = useState(0);
  const [filiacaoEncontrada, setFiliacaoEncontrada] = useState(false);
  const tituloRef = useRef<HTMLHeadingElement>(null);

  const ocupado = preCadastro.isPending || cadastro.isPending;
  const { rotulo, titulo, subtitulo } = passos[passo];

  function irPara(destino: number) {
    flushSync(() => setPasso(destino));
    tituloRef.current?.focus();
  }

  async function consultarFiliacao() {
    const { filiado_pmi, email, pmi_id } = getValues();
    if (filiado_pmi !== "sim") {
      setFiliacaoEncontrada(false);
      return;
    }
    const resposta = await preCadastro
      .mutateAsync({ email: email.trim(), pmi_id: pmi_id.trim() })
      .catch(() => null);
    const nomePmi = resposta?.filiado ? resposta.dados?.nome_completo : undefined;
    if (nomePmi) setValue("nome_completo", nomePmi);
    setFiliacaoEncontrada(Boolean(nomePmi));
  }

  async function concluir() {
    try {
      await cadastro.mutateAsync(montarCadastro(getValues()));
      roteador.push(caminhoDeConfirmacao(getValues("email").trim()));
    } catch (erro) {
      const campos = aplicarErrosDeCampo(erro, setError);
      if (campos.length === 0) return;
      const destino = Math.min(...campos.map(passoDoCampo));
      irPara(destino);
      const primeiro = camposPorPasso[destino].find((campo) => campos.includes(campo));
      if (primeiro) setFocus(primeiro);
    }
  }

  async function avancar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (ocupado) return;
    const valido = await trigger([...camposPorPasso[passo]], { shouldFocus: true });
    if (!valido) return;
    if (passo === 0) await consultarFiliacao();
    if (passo < ULTIMO_PASSO) irPara(passo + 1);
    else await concluir();
  }

  const erroGeral =
    cadastro.error && !(ehErroApi(cadastro.error) && cadastro.error.codigo === "DADOS_INVALIDOS")
      ? mensagemDeErro(cadastro.error)
      : null;

  return (
    <FormProvider {...formulario}>
      <div className="flex flex-col gap-6">
        <IndicadorEtapas atual={passo + 1} total={passos.length} titulo={rotulo} />
        <header className="flex flex-col gap-2">
          <h1 ref={tituloRef} tabIndex={-1} className="text-h2 focus:outline-none">
            {titulo}
          </h1>
          <p className="text-texto-secundario">{subtitulo}</p>
        </header>

        <form noValidate onSubmit={avancar} className="flex flex-col gap-5">
          {passo === 0 && <PassoAcesso />}
          {passo === 1 && <PassoPessoal filiacaoEncontrada={filiacaoEncontrada} />}
          {passo === 2 && <PassoEndereco />}
          {passo === 3 && <PassoProfissional />}

          {passo === ULTIMO_PASSO && (
            <>
              {erroGeral && <Alerta tom="erro" titulo={erroGeral} />}
              <p className="text-legenda text-texto-secundario">
                Ao criar a conta, enviaremos um código de 6 dígitos para confirmar seu e-mail.
              </p>
            </>
          )}

          {passo === 0 ? (
            <Botao type="submit" larguraTotal carregando={preCadastro.isPending}>
              Continuar
            </Botao>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Botao
                type="button"
                variante="secundario"
                disabled={ocupado}
                onClick={() => irPara(passo - 1)}
              >
                Voltar
              </Botao>
              <Botao type="submit" carregando={cadastro.isPending}>
                {passo === ULTIMO_PASSO ? "Criar conta" : "Continuar"}
              </Botao>
            </div>
          )}
        </form>

        {passo === 0 && (
          <p className="text-center text-corpo-pequeno text-texto-secundario">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="font-medium text-texto-marca underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-acao-destaque"
            >
              Entrar
            </Link>
          </p>
        )}
      </div>
    </FormProvider>
  );
}
