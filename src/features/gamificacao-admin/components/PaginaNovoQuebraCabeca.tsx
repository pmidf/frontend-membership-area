"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import { CartaoSurpresa } from "@/features/gamificacao/components/CartaoSurpresa";
import { aplicarErrosDeCampo } from "@/shared/api/aplicar-erros-de-campo";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { useAvisoAoSair } from "@/shared/hooks/useAvisoAoSair";
import { CartaoPublicacao } from "@/shared/publicacao/CartaoPublicacao";
import { Botao, CabecalhoPagina, Cartao, LinkVoltar, SeloStatus, useAvisos } from "@/shared/ui";

import {
  transicaoInvalida,
  useCriarQuebraCabeca,
  usePublicarQuebraCabeca,
} from "../api/quebra-cabecas.queries";
import {
  esquemaQuebraCabeca,
  valoresIniciais,
  type DadosQuebraCabeca,
  type QuebraCabecaValidado,
} from "../schemas/quebra-cabeca.schema";
import { FormularioQuebraCabeca } from "./FormularioQuebraCabeca";
import { ModalPreviaQuebraCabeca } from "./ModalPreviaQuebraCabeca";

const ID_FORMULARIO = "formulario-quebra-cabeca";

type Destino = "rascunho" | "catalogo";

export function PaginaNovoQuebraCabeca() {
  const roteador = useRouter();
  const avisos = useAvisos();
  const criacao = useCriarQuebraCabeca();
  const publicacao = usePublicarQuebraCabeca();
  const [previa, setPrevia] = useState(false);
  const [destino, setDestino] = useState<Destino | null>(null);
  const formulario = useForm<DadosQuebraCabeca, unknown, QuebraCabecaValidado>({
    resolver: zodResolver(esquemaQuebraCabeca),
    defaultValues: valoresIniciais,
  });
  const {
    handleSubmit,
    setError,
    control,
    formState: { isDirty, isSubmitSuccessful },
  } = formulario;
  const dados = useWatch({ control }) as DadosQuebraCabeca;
  const enviando = criacao.isPending || publicacao.isPending;

  useAvisoAoSair(isDirty && !isSubmitSuccessful);

  function salvar(proximo: Destino) {
    return handleSubmit(async (validado) => {
      if (enviando) return;
      setDestino(proximo);
      try {
        const criado = await criacao.mutateAsync(validado);
        if (proximo === "rascunho") {
          avisos.sucesso("Rascunho salvo.");
          roteador.push("/admin/quebra-cabecas");
          return;
        }
        try {
          await publicacao.mutateAsync(criado.id_quebra_cabeca);
          avisos.sucesso("Quebra-cabeça adicionado ao catálogo.");
        } catch (erro) {
          avisos.informacao(
            transicaoInvalida(erro)
              ? "O rascunho foi salvo, mas a situação mudou antes de publicar."
              : "O rascunho foi salvo, mas não foi possível publicar. Publique pela lista.",
          );
        }
        roteador.push("/admin/quebra-cabecas");
      } catch (erro) {
        if (aplicarErrosDeCampo(erro, setError).length === 0) avisos.erro(mensagemDeErro(erro));
      } finally {
        setDestino(null);
      }
    });
  }

  return (
    <FormProvider {...formulario}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <LinkVoltar href="/admin/quebra-cabecas">
          Voltar para o catálogo de quebra-cabeças
        </LinkVoltar>
        <CabecalhoPagina
          titulo="Novo quebra-cabeça"
          acoes={<SeloStatus tom="neutro">Rascunho</SeloStatus>}
        />
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_21rem]">
          <form
            id={ID_FORMULARIO}
            noValidate
            onSubmit={(evento) => void salvar("rascunho")(evento)}
            className="flex min-w-0 flex-col gap-5"
          >
            <FormularioQuebraCabeca />
          </form>
          <div className="flex flex-col gap-5">
            <CartaoPublicacao
              situacao="RASCUNHO"
              nota="Ao adicionar ao catálogo, o quebra-cabeça entra no sorteio para o próximo filiado que completar o atual. A imagem real só é revelada a quem montar todas as peças."
            >
              <div className="flex flex-col gap-3">
                <Botao
                  larguraTotal
                  carregando={destino === "catalogo"}
                  disabled={enviando && destino !== "catalogo"}
                  onClick={() => void salvar("catalogo")()}
                >
                  Adicionar ao catálogo
                </Botao>
                <Botao
                  type="submit"
                  form={ID_FORMULARIO}
                  variante="secundario"
                  larguraTotal
                  carregando={destino === "rascunho"}
                  disabled={enviando && destino !== "rascunho"}
                >
                  Salvar rascunho
                </Botao>
              </div>
            </CartaoPublicacao>
            <Botao
              variante="link"
              className="self-start"
              aria-haspopup="dialog"
              onClick={() => setPrevia(true)}
            >
              Pré-visualizar
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
      </div>
      <ModalPreviaQuebraCabeca aberto={previa} dados={dados} aoFechar={() => setPrevia(false)} />
    </FormProvider>
  );
}
