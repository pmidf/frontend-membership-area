"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { aplicarErrosDeCampo } from "@/shared/api/aplicar-erros-de-campo";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { useAvisoAoSair } from "@/shared/hooks/useAvisoAoSair";
import { formatarDataHora } from "@/shared/lib/datas";
import { AcoesPublicacao } from "@/shared/publicacao/AcoesPublicacao";
import { CartaoPublicacao } from "@/shared/publicacao/CartaoPublicacao";
import { rotulosSituacao } from "@/shared/publicacao/situacao";
import {
  Alerta,
  DialogoConfirmacao,
  EstadoErro,
  EstadoVazio,
  Esqueleto,
  LinkVoltar,
  SeloStatus,
  useAvisos,
} from "@/shared/ui";
import { classesBotao } from "@/shared/ui/botao/Botao";

import {
  conflitoDeSituacao,
  conteudoAdminNaoEncontrado,
  useArquivarConteudo,
  useAtualizarConteudo,
  useConteudoAdmin,
  usePublicarConteudo,
  useRecarregarConteudo,
} from "../api/conteudos-admin.queries";
import { acoesPorSituacao } from "../lib/acoes-por-situacao";
import { camposAlteradosDoConteudo, valoresDoConteudo } from "../lib/valores-conteudo";
import { esquemaConteudo, type DadosConteudo } from "../schemas/conteudo.schema";
import type { ConteudoAdmin } from "../tipos/conteudo-admin";
import { EstruturaFormularioConteudo, ID_FORMULARIO_CONTEUDO } from "./EstruturaFormularioConteudo";

const CAMINHO_BIBLIOTECA = "/admin/conteudos";

function EdicaoConteudo({
  conteudo,
  destinoVolta,
}: {
  conteudo: ConteudoAdmin;
  destinoVolta: string;
}) {
  const { id_conteudo: id, situacao } = conteudo;
  const avisos = useAvisos();
  const atualizacao = useAtualizarConteudo(id);
  const publicacao = usePublicarConteudo();
  const arquivamento = useArquivarConteudo(id);
  const recarregar = useRecarregarConteudo(id);
  const [confirmandoArquivo, setConfirmandoArquivo] = useState(false);
  const formulario = useForm<DadosConteudo>({
    resolver: zodResolver(esquemaConteudo),
    defaultValues: valoresDoConteudo(conteudo),
  });
  const {
    handleSubmit,
    setError,
    reset,
    formState: { isDirty },
  } = formulario;
  const arquivado = situacao === "ARQUIVADO";

  useAvisoAoSair(isDirty && !arquivado);

  function tratarErroDaAcao(erro: unknown, conflito: string) {
    if (conflitoDeSituacao(erro)) {
      avisos.informacao(conflito);
      recarregar();
      return;
    }
    avisos.erro(mensagemDeErro(erro));
  }

  async function salvarAlteracoes(dados: DadosConteudo): Promise<boolean> {
    const alterados = camposAlteradosDoConteudo(valoresDoConteudo(conteudo), dados);
    if (Object.keys(alterados).length === 0) return true;
    try {
      reset(valoresDoConteudo(await atualizacao.mutateAsync(alterados)));
      return true;
    } catch (erro) {
      if (aplicarErrosDeCampo(erro, setError).length === 0) {
        tratarErroDaAcao(erro, "Este conteúdo foi arquivado e não pode mais ser editado.");
      }
      return false;
    }
  }

  const salvar = handleSubmit(async (dados) => {
    if (atualizacao.isPending) return;
    if (await salvarAlteracoes(dados)) avisos.sucesso("Conteúdo atualizado");
  });

  const publicar = handleSubmit(async (dados) => {
    if (publicacao.isPending || !(await salvarAlteracoes(dados))) return;
    try {
      await publicacao.mutateAsync(id);
      avisos.sucesso("Conteúdo publicado");
    } catch (erro) {
      tratarErroDaAcao(erro, "Este conteúdo já não está em rascunho.");
    }
  });

  function arquivar() {
    arquivamento.mutate(undefined, {
      onSuccess: () => avisos.sucesso("Conteúdo arquivado"),
      onError: (erro) => avisos.erro(mensagemDeErro(erro)),
      onSettled: () => setConfirmandoArquivo(false),
    });
  }

  return (
    <FormProvider {...formulario}>
      <EstruturaFormularioConteudo
        titulo="Edição de conteúdo"
        destinoVolta={destinoVolta}
        acoesCabecalho={
          <SeloStatus tom={rotulosSituacao[situacao].tom}>
            {rotulosSituacao[situacao].rotulo}
          </SeloStatus>
        }
        aoEnviar={salvar}
        bloqueado={arquivado}
        tipoTravado
        lateral={
          <>
            <CartaoPublicacao
              situacao={situacao}
              detalhes={[
                { termo: "Criado em", valor: formatarDataHora(conteudo.data_criacao) },
                { termo: "Última edição", valor: formatarDataHora(conteudo.data_atualizacao) },
              ]}
              nota={
                !arquivado &&
                "Arquivar tira o conteúdo do catálogo. As estatísticas de acesso são mantidas."
              }
            >
              <AcoesPublicacao
                idFormulario={ID_FORMULARIO_CONTEUDO}
                acoes={acoesPorSituacao(situacao)}
                rotuloPublicar="Publicar conteúdo"
                semAlteracoes={!isDirty}
                salvando={atualizacao.isPending}
                publicando={publicacao.isPending}
                aoPublicar={() => void publicar()}
                aoArquivar={() => setConfirmandoArquivo(true)}
                somenteLeitura={
                  <Alerta tom="alerta" titulo="Conteúdo arquivado">
                    Ele saiu do catálogo e não pode mais ser editado.
                  </Alerta>
                }
              />
            </CartaoPublicacao>
            {situacao !== "RASCUNHO" && (
              <Link
                href={`${CAMINHO_BIBLIOTECA}/${id}/estatisticas`}
                className={classesBotao({ variante: "secundario" })}
              >
                Ver estatísticas
              </Link>
            )}
          </>
        }
      />
      <DialogoConfirmacao
        aberto={confirmandoArquivo}
        aoFechar={() => setConfirmandoArquivo(false)}
        aoConfirmar={arquivar}
        titulo="Arquivar conteúdo?"
        descricao="O conteúdo sai do catálogo. As estatísticas de acesso são mantidas."
        rotuloConfirmar="Arquivar"
        tom="perigo"
        carregando={arquivamento.isPending}
      />
    </FormProvider>
  );
}

export function PaginaEditarConteudo() {
  const { id } = useParams<{ id: string }>();
  const consulta = useSearchParams().toString();
  const conteudo = useConteudoAdmin(id);
  const destinoVolta = consulta ? `${CAMINHO_BIBLIOTECA}?${consulta}` : CAMINHO_BIBLIOTECA;

  if (conteudo.isPending) {
    return <Esqueleto variante="cartao" quantidade={2} rotulo="Carregando o conteúdo…" />;
  }
  if (conteudo.isError) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <LinkVoltar href={destinoVolta}>Voltar para a biblioteca</LinkVoltar>
        {conteudoAdminNaoEncontrado(conteudo.error) ? (
          <EstadoVazio titulo="Conteúdo não encontrado" />
        ) : (
          <EstadoErro
            mensagem="Não foi possível carregar o conteúdo."
            aoTentarNovamente={() => void conteudo.refetch()}
          />
        )}
      </div>
    );
  }
  return (
    <EdicaoConteudo
      key={`${conteudo.data.id_conteudo}-${conteudo.data.situacao}`}
      conteudo={conteudo.data}
      destinoVolta={destinoVolta}
    />
  );
}
