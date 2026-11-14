"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import { CartaoSurpresa } from "@/features/gamificacao/components/CartaoSurpresa";
import { aplicarErrosDeCampo } from "@/shared/api/aplicar-erros-de-campo";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { useAvisoAoSair } from "@/shared/hooks/useAvisoAoSair";
import {
  Alerta,
  Botao,
  CabecalhoPagina,
  Cartao,
  Esqueleto,
  EstadoErro,
  EstadoVazio,
  LinkVoltar,
  SeloStatus,
  useAvisos,
} from "@/shared/ui";

import {
  conflitoDeEdicao,
  quebraCabecaNaoEncontrado,
  transicaoInvalida,
  useEditarQuebraCabeca,
  usePublicarQuebraCabeca,
  useQuebraCabecaAdmin,
  useRecarregarQuebraCabeca,
} from "../api/quebra-cabecas.queries";
import { rotulosSituacaoQuebraCabeca } from "../lib/acoes-por-situacao";
import { alteracoesDoQuebraCabeca, valoresDoQuebraCabeca } from "../lib/edicao-quebra-cabeca";
import {
  esquemaQuebraCabeca,
  type DadosQuebraCabeca,
  type QuebraCabecaValidado,
} from "../schemas/quebra-cabeca.schema";
import type { QuebraCabecaAdmin } from "../tipos/quebra-cabeca-admin";
import { FormularioQuebraCabeca } from "./FormularioQuebraCabeca";
import { ModalAlteracoesSalvas } from "./ModalAlteracoesSalvas";
import { ModalPreviaQuebraCabeca } from "./ModalPreviaQuebraCabeca";

const ID_FORMULARIO = "formulario-editar-quebra-cabeca";
export const MENSAGEM_IMAGEM_SEM_RECORTES =
  "Ao trocar a imagem completa, informe também os 8 recortes novos.";
export const MENSAGEM_FORA_DO_AR = "Suba o quebra-cabeça novamente para editá-lo.";

function EdicaoQuebraCabeca({ quebraCabeca }: { quebraCabeca: QuebraCabecaAdmin }) {
  const { id_quebra_cabeca: id, situacao } = quebraCabeca;
  const avisos = useAvisos();
  const edicao = useEditarQuebraCabeca(id);
  const publicacao = usePublicarQuebraCabeca();
  const recarregar = useRecarregarQuebraCabeca(id);
  const [previa, setPrevia] = useState(false);
  const [salvo, setSalvo] = useState<string | null>(null);
  const [bloqueioLocal, setBloqueioLocal] = useState(false);
  const original = valoresDoQuebraCabeca(quebraCabeca);
  const formulario = useForm<DadosQuebraCabeca, unknown, QuebraCabecaValidado>({
    resolver: zodResolver(esquemaQuebraCabeca),
    defaultValues: original,
  });
  const {
    handleSubmit,
    setError,
    setValue,
    reset,
    control,
    formState: { isDirty },
  } = formulario;
  const dados = useWatch({ control }) as DadosQuebraCabeca;
  const foraDoAr = situacao === "FORA_DO_AR";
  const imagemBloqueada = !quebraCabeca.pode_trocar_imagem || bloqueioLocal;
  const ocupado = edicao.isPending || publicacao.isPending;

  useAvisoAoSair(isDirty && !foraDoAr);

  function restaurarImagem() {
    setValue("imagem_original", original.imagem_original);
    setValue("recortes", original.recortes);
  }

  function tratarErro(erro: unknown) {
    const conflito = conflitoDeEdicao(erro);
    if (conflito === "IMAGEM_BLOQUEADA") {
      setBloqueioLocal(true);
      restaurarImagem();
      avisos.informacao("Filiados começaram a montar este quebra-cabeça. A imagem foi bloqueada.");
      void recarregar();
      return;
    }
    if (conflito === "FORA_DO_AR" || quebraCabecaNaoEncontrado(erro)) {
      avisos.informacao(mensagemDeErro(erro));
      void recarregar();
      return;
    }
    if (aplicarErrosDeCampo(erro, setError).length === 0) avisos.erro(mensagemDeErro(erro));
  }

  async function salvarAlteracoes(validado: QuebraCabecaValidado): Promise<boolean> {
    const resultado = alteracoesDoQuebraCabeca(original, validado);
    if (resultado.tipo === "imagem-sem-recortes") {
      setError("recortes", { type: "manual", message: MENSAGEM_IMAGEM_SEM_RECORTES });
      return false;
    }
    if (Object.keys(resultado.alteracoes).length === 0) return true;
    try {
      await edicao.mutateAsync(resultado.alteracoes);
      reset(validado);
      return true;
    } catch (erro) {
      tratarErro(erro);
      return false;
    }
  }

  const salvar = handleSubmit(async (validado) => {
    if (ocupado) return;
    if (await salvarAlteracoes(validado)) setSalvo(validado.nome);
  });

  const publicar = handleSubmit(async (validado) => {
    if (ocupado || !(await salvarAlteracoes(validado))) return;
    try {
      await publicacao.mutateAsync(id);
      avisos.sucesso("Quebra-cabeça publicado. Ele já entra no sorteio.");
      void recarregar();
    } catch (erro) {
      if (transicaoInvalida(erro)) {
        avisos.informacao("A situação mudou. Atualizamos o quebra-cabeça.");
        void recarregar();
        return;
      }
      avisos.erro(mensagemDeErro(erro));
    }
  });

  const rotulo = rotulosSituacaoQuebraCabeca[situacao];

  return (
    <FormProvider {...formulario}>
      <CabecalhoPagina
        titulo="Editar quebra-cabeça"
        acoes={<SeloStatus tom={rotulo.tom}>{rotulo.rotulo}</SeloStatus>}
      />
      {foraDoAr && (
        <Alerta tom="alerta" titulo="Quebra-cabeça fora do ar.">
          {MENSAGEM_FORA_DO_AR}
        </Alerta>
      )}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <form
          id={ID_FORMULARIO}
          noValidate
          onSubmit={(evento) => void salvar(evento)}
          className="min-w-0"
        >
          <fieldset disabled={foraDoAr} className="flex min-w-0 flex-col gap-5">
            <legend className="sr-only">Dados do quebra-cabeça</legend>
            <FormularioQuebraCabeca imagemBloqueada={imagemBloqueada} />
          </fieldset>
        </form>
        <div className="flex flex-col gap-5">
          <Cartao className="flex flex-col gap-4 p-5 md:p-6">
            <h2 className="text-lg font-bold">Publicação</h2>
            <dl className="flex items-center justify-between gap-3 text-corpo-pequeno">
              <dt className="text-texto-secundario">Status</dt>
              <dd className="font-medium">{rotulo.rotulo}</dd>
            </dl>
            {!foraDoAr && (
              <div className="flex flex-col gap-3">
                <Botao
                  type="submit"
                  form={ID_FORMULARIO}
                  larguraTotal
                  carregando={edicao.isPending && !publicacao.isPending}
                  disabled={!isDirty || publicacao.isPending}
                >
                  Salvar alterações
                </Botao>
                {situacao === "RASCUNHO" && (
                  <Botao
                    variante="secundario"
                    larguraTotal
                    carregando={publicacao.isPending}
                    disabled={edicao.isPending}
                    onClick={() => void publicar()}
                  >
                    Publicar
                  </Botao>
                )}
              </div>
            )}
            <p className="text-legenda text-texto-secundario">
              {situacao === "RASCUNHO"
                ? "Ao publicar, o quebra-cabeça entra no sorteio para o próximo filiado que completar o atual."
                : "A imagem real só é revelada a quem montar todas as peças. Toda edição fica registrada na auditoria."}
            </p>
          </Cartao>
          <Botao
            variante="link"
            className="self-start"
            aria-haspopup="dialog"
            onClick={() => setPrevia(true)}
          >
            🔍 Pré-visualizar
          </Botao>
          <Cartao className="flex flex-col gap-4 p-5 md:p-6">
            <header className="flex flex-col gap-1">
              <h2 className="text-lg font-bold">Prévia no catálogo</h2>
              <p className="text-corpo-pequeno text-texto-secundario">
                É assim que os filiados verão até alguém completar.
              </p>
            </header>
            <CartaoSurpresa />
          </Cartao>
        </div>
      </div>
      <ModalPreviaQuebraCabeca aberto={previa} dados={dados} aoFechar={() => setPrevia(false)} />
      <ModalAlteracoesSalvas
        nome={salvo}
        imagemBloqueada={imagemBloqueada}
        aoFechar={() => setSalvo(null)}
      />
    </FormProvider>
  );
}

export function PaginaEditarQuebraCabeca() {
  const { id } = useParams<{ id: string }>();
  const consulta = useQuebraCabecaAdmin(id);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <LinkVoltar href="/admin/quebra-cabecas">Voltar para o catálogo de quebra-cabeças</LinkVoltar>
      {consulta.data ? (
        <EdicaoQuebraCabeca
          key={`${consulta.data.id_quebra_cabeca}-${consulta.data.situacao}`}
          quebraCabeca={consulta.data}
        />
      ) : quebraCabecaNaoEncontrado(consulta.error) ? (
        <EstadoVazio
          titulo="Quebra-cabeça não encontrado"
          descricao="Ele pode ter sido removido. Volte para o catálogo e escolha outro."
        />
      ) : consulta.isError ? (
        <EstadoErro
          mensagem="Não foi possível carregar o quebra-cabeça."
          aoTentarNovamente={() => void consulta.refetch()}
        />
      ) : (
        <Esqueleto variante="cartao" quantidade={2} rotulo="Carregando o quebra-cabeça…" />
      )}
    </div>
  );
}
