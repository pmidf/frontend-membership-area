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
  useDespublicarConteudo,
  usePublicarConteudo,
  useRecarregarConteudo,
} from "../api/conteudos-admin.queries";
import { acoesPorSituacao } from "../lib/acoes-por-situacao";
import { camposAlteradosDoConteudo, valoresDoConteudo } from "../lib/valores-conteudo";
import { esquemaConteudo, type DadosConteudo } from "../schemas/conteudo.schema";
import type { ConteudoAdmin } from "../tipos/conteudo-admin";
import { EstruturaFormularioConteudo, ID_FORMULARIO_CONTEUDO } from "./EstruturaFormularioConteudo";

const CAMINHO_BIBLIOTECA = "/admin/conteudos";

const notaPublicacao: Record<ConteudoAdmin["situacao"], string | null> = {
  RASCUNHO: "Arquivar tira o conteúdo da biblioteca. As estatísticas de acesso são mantidas.",
  PUBLICADO:
    "Despublicar volta o conteúdo para rascunho e o tira do catálogo e das trilhas. Arquivar o tira de vez; as estatísticas são mantidas.",
  ARQUIVADO: null,
};

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
  const despublicacao = useDespublicarConteudo();
  const arquivamento = useArquivarConteudo(id);
  const recarregar = useRecarregarConteudo(id);
  const [confirmando, setConfirmando] = useState<"despublicar" | "arquivar" | null>(null);
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

  const despublicar = handleSubmit(
    async (dados) => {
      if (despublicacao.isPending) return;
      if (!(await salvarAlteracoes(dados))) return setConfirmando(null);
      try {
        await despublicacao.mutateAsync(id);
        avisos.sucesso("Conteúdo despublicado");
      } catch (erro) {
        tratarErroDaAcao(erro, "Este conteúdo já não está publicado.");
      } finally {
        setConfirmando(null);
      }
    },
    () => setConfirmando(null),
  );

  function arquivar() {
    arquivamento.mutate(undefined, {
      onSuccess: () => avisos.sucesso("Conteúdo arquivado"),
      onError: (erro) => avisos.erro(mensagemDeErro(erro)),
      onSettled: () => setConfirmando(null),
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
              nota={notaPublicacao[situacao]}
            >
              <AcoesPublicacao
                idFormulario={ID_FORMULARIO_CONTEUDO}
                acoes={acoesPorSituacao(situacao)}
                rotuloPublicar="Publicar conteúdo"
                semAlteracoes={!isDirty}
                salvando={atualizacao.isPending}
                publicando={publicacao.isPending}
                aoPublicar={() => void publicar()}
                aoDespublicar={() => setConfirmando("despublicar")}
                aoArquivar={() => setConfirmando("arquivar")}
                somenteLeitura={
                  <Alerta tom="alerta" titulo="Conteúdo arquivado">
                    Ele saiu do catálogo e não pode mais ser editado.
                  </Alerta>
                }
              />
            </CartaoPublicacao>
            {conteudo.data_publicacao !== null && (
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
        aberto={confirmando === "despublicar"}
        aoFechar={() => setConfirmando(null)}
        aoConfirmar={() => void despublicar()}
        titulo="Despublicar conteúdo?"
        descricao={`O conteúdo volta para rascunho e sai do catálogo e das trilhas até ser publicado de novo. Acessos e estatísticas são mantidos.${isDirty ? " As alterações feitas no formulário serão salvas antes." : ""}`}
        rotuloConfirmar="Despublicar"
        carregando={atualizacao.isPending || despublicacao.isPending}
      />
      <DialogoConfirmacao
        aberto={confirmando === "arquivar"}
        aoFechar={() => setConfirmando(null)}
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
