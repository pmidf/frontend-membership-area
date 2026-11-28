"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { FORMATO_CODIGO } from "@/features/auth/schemas/confirmacao.schema";
import { ehErroApi } from "@/shared/api/erro-api";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import {
  Alerta,
  Botao,
  CampoCodigo,
  Esqueleto,
  EstadoErro,
  EstadoVazio,
  LinkVoltar,
  useAvisos,
} from "@/shared/ui";
import { classesBotao } from "@/shared/ui/botao/Botao";

import { useConfirmarCodigoPmi, useMinhaFiliacao } from "../api/filiacao.queries";
import { CAMINHO_SECAO_FILIACAO, CAMINHO_VINCULAR_FILIACAO } from "../lib/caminhos-filiacao";
import { MENSAGEM_FILIACAO_CONFIRMADA } from "../lib/mensagens-vinculacao";
import { BotaoReenviarCodigoPmi } from "./BotaoReenviarCodigoPmi";

const CODIGOS_DO_CAMPO = new Set(["CODIGO_INVALIDO", "CODIGO_EXPIRADO", "DADOS_INVALIDOS"]);

const classesLink =
  "font-medium text-texto-marca underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-acao-destaque";

export function PaginaCodigoPmi() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <LinkVoltar href={CAMINHO_SECAO_FILIACAO}>Voltar para Meu perfil</LinkVoltar>
      <ConteudoCodigoPmi />
    </div>
  );
}

function ConteudoCodigoPmi() {
  const minha = useMinhaFiliacao();

  if (minha.isPending) return <Esqueleto variante="cartao" rotulo="Carregando o código pendente" />;
  if (minha.isError) return <EstadoErro aoTentarNovamente={() => void minha.refetch()} />;

  const { situacao, email_pmi_mascarado: emailMascarado } = minha.data;
  if (situacao !== "AGUARDANDO_CODIGO" || !emailMascarado) {
    return (
      <EstadoVazio
        titulo="Não há código pendente"
        descricao="Para vincular sua filiação, informe seu PMI ID."
        acao={
          <Link href={CAMINHO_VINCULAR_FILIACAO} className={classesBotao({ tamanho: "sm" })}>
            Informar PMI ID
          </Link>
        }
      />
    );
  }

  return <FormularioCodigoPmi emailMascarado={emailMascarado} />;
}

function mensagemDoCampo(erro: unknown): string | undefined {
  if (!ehErroApi(erro) || !CODIGOS_DO_CAMPO.has(erro.codigo)) return undefined;
  return erro.campos?.codigo?.[0] ?? mensagemDeErro(erro);
}

function FormularioCodigoPmi({ emailMascarado }: { emailMascarado: string }) {
  const roteador = useRouter();
  const avisos = useAvisos();
  const confirmacao = useConfirmarCodigoPmi();
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
      await confirmacao.mutateAsync(valor);
      avisos.sucesso(MENSAGEM_FILIACAO_CONFIRMADA);
      roteador.replace(CAMINHO_SECAO_FILIACAO);
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
    <>
      <header className="flex flex-col gap-2">
        <h1 className="text-h2">Confirme o e-mail do PMI</h1>
        <p className="text-texto-secundario">
          Enviamos um código de 6 dígitos para{" "}
          <strong className="font-medium wrap-anywhere text-texto-primario">
            {emailMascarado}
          </strong>
          , o e-mail cadastrado no PMI. Ao confirmar, ele passa a fazer parte da sua conta e sua
          filiação é liberada.
        </p>
      </header>
      <div className="flex flex-col gap-6">
        <form noValidate onSubmit={enviar} className="flex flex-col gap-5">
          <CampoCodigo
            key={montagem}
            rotulo={<span className="sr-only">Código enviado ao e-mail do PMI</span>}
            valor={codigo}
            aoMudar={setCodigo}
            aoCompletar={(valor) => void confirmar(valor)}
            ajuda="O código vale por 10 minutos."
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
        <BotaoReenviarCodigoPmi destacar={codigoExpirado} aoReenviar={aoReenviar} />
      </div>
      <p className="text-center text-corpo-pequeno text-texto-secundario">
        Não tem mais acesso a esse e-mail? Atualize-o no MyPMI e{" "}
        <Link href={CAMINHO_VINCULAR_FILIACAO} className={classesLink}>
          informe o PMI ID de novo
        </Link>
        .
      </p>
    </>
  );
}
