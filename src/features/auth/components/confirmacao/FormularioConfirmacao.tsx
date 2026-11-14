"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { ehErroApi } from "@/shared/api/erro-api";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { Alerta, Botao, CampoCodigo } from "@/shared/ui";

import type { RespostaConfirmacao } from "../../api/auth.api";
import { useConfirmarEmail } from "../../api/auth.queries";
import { FORMATO_CODIGO } from "../../schemas/confirmacao.schema";
import { BotaoReenviarCodigo } from "./BotaoReenviarCodigo";

type PropsFormularioConfirmacao = {
  email: string;
  vindoDoLogin: boolean;
  segundosParaReenvio: number;
  aoConfirmar: (resposta: RespostaConfirmacao) => Promise<void>;
};

const CODIGOS_DO_CAMPO = new Set(["CODIGO_INVALIDO", "CODIGO_EXPIRADO", "DADOS_INVALIDOS"]);

function mensagemDoCampo(erro: unknown): string | undefined {
  if (!ehErroApi(erro) || !CODIGOS_DO_CAMPO.has(erro.codigo)) return undefined;
  const campos = erro.campos ?? {};
  return campos.codigo?.[0] ?? campos.email?.[0] ?? mensagemDeErro(erro);
}

export function FormularioConfirmacao({
  email,
  vindoDoLogin,
  segundosParaReenvio,
  aoConfirmar,
}: PropsFormularioConfirmacao) {
  const confirmacao = useConfirmarEmail();
  const [codigo, setCodigo] = useState("");
  const [montagem, setMontagem] = useState(0);
  const [codigoExpirado, setCodigoExpirado] = useState(false);

  function recomecar() {
    setCodigo("");
    setMontagem((atual) => atual + 1);
  }

  async function confirmar(valor: string) {
    if (!FORMATO_CODIGO.test(valor) || confirmacao.isPending) return;
    try {
      await aoConfirmar(await confirmacao.mutateAsync({ email, codigo: valor }));
    } catch (erro) {
      if (!ehErroApi(erro)) return;
      if (erro.codigo === "CODIGO_EXPIRADO") setCodigoExpirado(true);
      if (erro.codigo === "CODIGO_INVALIDO" || erro.codigo === "CODIGO_EXPIRADO") recomecar();
    }
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    void confirmar(codigo);
  }

  function aoReenviar() {
    setCodigoExpirado(false);
    confirmacao.reset();
    recomecar();
  }

  const erroDoCampo = mensagemDoCampo(confirmacao.error);
  const erroGeral = confirmacao.error && !erroDoCampo ? mensagemDeErro(confirmacao.error) : null;

  return (
    <div className="flex flex-col gap-6">
      {vindoDoLogin && <Alerta tom="informacao" titulo="Confirme seu e-mail para entrar." />}
      <header className="flex flex-col gap-2">
        <h1 className="text-h2">Confirme seu e-mail</h1>
        <p className="text-texto-secundario">
          Enviamos um código de 6 dígitos para{" "}
          <strong className="font-medium wrap-anywhere text-texto-primario">{email}</strong>. Digite
          abaixo.
        </p>
      </header>

      <form noValidate onSubmit={enviar} className="flex flex-col gap-5">
        <CampoCodigo
          key={montagem}
          rotulo={<span className="sr-only">Código de confirmação</span>}
          valor={codigo}
          aoMudar={setCodigo}
          aoCompletar={(valor) => void confirmar(valor)}
          ajuda="O código vale por 24 horas."
          erro={erroDoCampo}
          desabilitado={confirmacao.isPending}
          focarAoMontar
        />
        {erroGeral && <Alerta tom="erro" titulo={erroGeral} />}
        <Botao
          type="submit"
          larguraTotal
          disabled={codigo.length < 6}
          carregando={confirmacao.isPending}
        >
          Confirmar
        </Botao>
      </form>

      <BotaoReenviarCodigo
        email={email}
        segundosIniciais={segundosParaReenvio}
        destacar={codigoExpirado}
        aoReenviar={aoReenviar}
      />

      <p className="text-center text-corpo-pequeno text-texto-secundario">
        E-mail errado?{" "}
        <Link
          href="/cadastro"
          className="font-medium text-texto-marca underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-acao-destaque"
        >
          Corrigir e-mail
        </Link>
      </p>
    </div>
  );
}
