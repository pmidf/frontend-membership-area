"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

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

import { conflitoDeSituacao } from "../api/conteudos-admin.queries";
import {
  trilhaNaoEncontrada,
  useArquivarTrilha,
  useAtualizarTrilha,
  useDespublicarTrilha,
  usePublicarTrilha,
  useRecarregarTrilha,
  useTrilhaAdmin,
} from "../api/trilhas-admin.queries";
import { acoesPorSituacao } from "../lib/acoes-por-situacao";
import {
  aplicarErrosDaTrilha,
  camposAlteradosDaTrilha,
  destinoVoltaTrilhas,
  MENSAGEM_SEM_PUBLICADO,
  temConteudoPublicado,
  valoresDaTrilha,
} from "../lib/valores-trilha";
import { esquemaTrilha, type DadosTrilha } from "../schemas/trilha.schema";
import type { TrilhaAdmin } from "../tipos/trilha-admin";
import { EstruturaFormularioTrilha, ID_FORMULARIO_TRILHA } from "./EstruturaFormularioTrilha";

const notaPublicacao: Record<TrilhaAdmin["situacao"], string | null> = {
  RASCUNHO: "Arquivar tira a trilha do console. Os conteúdos continuam na biblioteca.",
  PUBLICADO:
    "Despublicar volta a trilha para rascunho e a tira do catálogo. Arquivar a tira de vez; os conteúdos continuam na biblioteca.",
  ARQUIVADO: null,
};

function EdicaoTrilha({ trilha, destinoVolta }: { trilha: TrilhaAdmin; destinoVolta: string }) {
  const { id_trilha: id, situacao } = trilha;
  const avisos = useAvisos();
  const atualizacao = useAtualizarTrilha(id);
  const publicacao = usePublicarTrilha();
  const despublicacao = useDespublicarTrilha();
  const arquivamento = useArquivarTrilha(id);
  const recarregar = useRecarregarTrilha(id);
  const [confirmando, setConfirmando] = useState<"despublicar" | "arquivar" | null>(null);
  const formulario = useForm<DadosTrilha>({
    resolver: zodResolver(esquemaTrilha),
    defaultValues: valoresDaTrilha(trilha),
  });
  const {
    handleSubmit,
    setError,
    reset,
    formState: { isDirty },
  } = formulario;
  const arquivada = situacao === "ARQUIVADO";

  useAvisoAoSair(isDirty && !arquivada);

  function tratarErroDaAcao(erro: unknown, conflito: string) {
    if (conflitoDeSituacao(erro)) {
      avisos.informacao(conflito);
      recarregar();
      return;
    }
    if (!aplicarErrosDaTrilha(erro, setError)) avisos.erro(mensagemDeErro(erro));
  }

  async function salvarAlteracoes(dados: DadosTrilha): Promise<boolean> {
    const alterados = camposAlteradosDaTrilha(valoresDaTrilha(trilha), dados);
    if (Object.keys(alterados).length === 0) return true;
    try {
      reset(valoresDaTrilha(await atualizacao.mutateAsync(alterados)));
      return true;
    } catch (erro) {
      tratarErroDaAcao(erro, "Esta trilha foi arquivada e não pode mais ser editada.");
      return false;
    }
  }

  const salvar = handleSubmit(async (dados) => {
    if (atualizacao.isPending) return;
    if (await salvarAlteracoes(dados)) avisos.sucesso("Trilha atualizada");
  });

  const publicar = handleSubmit(async (dados) => {
    if (publicacao.isPending) return;
    if (!temConteudoPublicado(dados.itens)) {
      setError("itens", { type: "regra", message: MENSAGEM_SEM_PUBLICADO });
      return;
    }
    if (!(await salvarAlteracoes(dados))) return;
    try {
      await publicacao.mutateAsync(id);
      avisos.sucesso("Trilha publicada");
    } catch (erro) {
      tratarErroDaAcao(erro, "Esta trilha já não está em rascunho.");
    }
  });

  const despublicar = handleSubmit(
    async (dados) => {
      if (despublicacao.isPending) return;
      if (!(await salvarAlteracoes(dados))) return setConfirmando(null);
      try {
        await despublicacao.mutateAsync(id);
        avisos.sucesso("Trilha despublicada");
      } catch (erro) {
        tratarErroDaAcao(erro, "Esta trilha já não está publicada.");
      } finally {
        setConfirmando(null);
      }
    },
    () => setConfirmando(null),
  );

  function arquivar() {
    arquivamento.mutate(undefined, {
      onSuccess: () => avisos.sucesso("Trilha arquivada"),
      onError: (erro) => avisos.erro(mensagemDeErro(erro)),
      onSettled: () => setConfirmando(null),
    });
  }

  return (
    <FormProvider {...formulario}>
      <EstruturaFormularioTrilha
        titulo="Edição de trilha"
        destinoVolta={destinoVolta}
        acoesCabecalho={
          <SeloStatus tom={rotulosSituacao[situacao].tom}>
            {rotulosSituacao[situacao].rotulo}
          </SeloStatus>
        }
        aoEnviar={salvar}
        bloqueado={arquivada}
        lateral={
          <CartaoPublicacao
            situacao={situacao}
            detalhes={[
              { termo: "Criada em", valor: formatarDataHora(trilha.data_criacao) },
              { termo: "Última edição", valor: formatarDataHora(trilha.data_atualizacao) },
              { termo: "Itens na trilha", valor: trilha.itens.length },
            ]}
            nota={notaPublicacao[situacao]}
          >
            <AcoesPublicacao
              idFormulario={ID_FORMULARIO_TRILHA}
              acoes={acoesPorSituacao(situacao)}
              rotuloPublicar="Publicar trilha"
              semAlteracoes={!isDirty}
              salvando={atualizacao.isPending}
              publicando={publicacao.isPending}
              aoPublicar={() => void publicar()}
              aoDespublicar={() => setConfirmando("despublicar")}
              aoArquivar={() => setConfirmando("arquivar")}
              somenteLeitura={
                <Alerta tom="alerta" titulo="Trilha arquivada">
                  Ela saiu do catálogo e não pode mais ser editada.
                </Alerta>
              }
            />
          </CartaoPublicacao>
        }
      />
      <DialogoConfirmacao
        aberto={confirmando === "despublicar"}
        aoFechar={() => setConfirmando(null)}
        aoConfirmar={() => void despublicar()}
        titulo="Despublicar trilha?"
        descricao={`A trilha volta para rascunho e sai do catálogo até ser publicada de novo. O progresso dos membros é mantido.${isDirty ? " As alterações feitas no formulário serão salvas antes." : ""}`}
        rotuloConfirmar="Despublicar"
        carregando={atualizacao.isPending || despublicacao.isPending}
      />
      <DialogoConfirmacao
        aberto={confirmando === "arquivar"}
        aoFechar={() => setConfirmando(null)}
        aoConfirmar={arquivar}
        titulo="Arquivar trilha?"
        descricao="A trilha sai do catálogo. Os conteúdos dela continuam na biblioteca."
        rotuloConfirmar="Arquivar"
        tom="perigo"
        carregando={arquivamento.isPending}
      />
    </FormProvider>
  );
}

export function PaginaEditarTrilha() {
  const { id } = useParams<{ id: string }>();
  const destinoVolta = destinoVoltaTrilhas(useSearchParams().toString());
  const trilha = useTrilhaAdmin(id);

  if (trilha.isPending) {
    return <Esqueleto variante="cartao" quantidade={2} rotulo="Carregando a trilha…" />;
  }
  if (trilha.isError) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <LinkVoltar href={destinoVolta}>Voltar para as trilhas</LinkVoltar>
        {trilhaNaoEncontrada(trilha.error) ? (
          <EstadoVazio titulo="Trilha não encontrada" />
        ) : (
          <EstadoErro
            mensagem="Não foi possível carregar a trilha."
            aoTentarNovamente={() => void trilha.refetch()}
          />
        )}
      </div>
    );
  }
  return (
    <EdicaoTrilha
      key={`${trilha.data.id_trilha}-${trilha.data.situacao}`}
      trilha={trilha.data}
      destinoVolta={destinoVolta}
    />
  );
}
