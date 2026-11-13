"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { aplicarErrosDeCampo } from "@/shared/api/aplicar-erros-de-campo";
import { ehErroApi } from "@/shared/api/erro-api";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { useAvisoAoSair } from "@/shared/hooks/useAvisoAoSair";
import { AcoesPublicacao } from "@/shared/publicacao/AcoesPublicacao";
import { CartaoPublicacao } from "@/shared/publicacao/CartaoPublicacao";
import { rotulosSituacao } from "@/shared/publicacao/situacao";
import {
  Alerta,
  Botao,
  CabecalhoPagina,
  DialogoConfirmacao,
  Esqueleto,
  EstadoErro,
  EstadoVazio,
  LinkVoltar,
  SeloStatus,
  useAvisos,
} from "@/shared/ui";
import { classesBotao } from "@/shared/ui/botao/Botao";

import type { BeneficioAdmin } from "../api/beneficios-admin.api";
import {
  beneficioAdminNaoEncontrado,
  useArquivarBeneficio,
  useAtualizarBeneficio,
  useBeneficioAdmin,
  useDespublicarBeneficio,
  useDuplicarBeneficio,
  usePublicarBeneficio,
  useRecarregarBeneficio,
} from "../api/beneficios-admin.queries";
import { acoesPorSituacao } from "../lib/acoes-por-situacao";
import { camposAlteradosDoBeneficio, valoresDoBeneficio } from "../lib/valores-beneficio";
import { esquemaBeneficio, type DadosBeneficio } from "../schemas/beneficio.schema";
import { FormularioBeneficio } from "./FormularioBeneficio";
import { PreviaCardBeneficio } from "./PreviaCardBeneficio";

const ID_FORMULARIO = "formulario-beneficio";
const CONFLITOS_DE_SITUACAO = new Set([
  "BENEFICIO_ARQUIVADO",
  "BENEFICIO_JA_PUBLICADO",
  "BENEFICIO_NAO_PUBLICADO",
]);

function textoResgates(quantidade: number): string {
  return quantidade === 1 ? "1 resgate" : `${quantidade} resgates`;
}

function EdicaoBeneficio({ beneficio }: { beneficio: BeneficioAdmin }) {
  const { id_beneficio: id, situacao, quantidade_resgates: resgates } = beneficio;
  const roteador = useRouter();
  const avisos = useAvisos();
  const atualizacao = useAtualizarBeneficio(id);
  const publicacao = usePublicarBeneficio(id);
  const despublicacao = useDespublicarBeneficio(id);
  const arquivamento = useArquivarBeneficio(id);
  const duplicacao = useDuplicarBeneficio();
  const recarregar = useRecarregarBeneficio(id);
  const [confirmando, setConfirmando] = useState<"despublicar" | "arquivar" | null>(null);
  const formulario = useForm<DadosBeneficio>({
    resolver: zodResolver(esquemaBeneficio),
    defaultValues: valoresDoBeneficio(beneficio),
  });
  const {
    handleSubmit,
    setError,
    reset,
    formState: { isDirty },
  } = formulario;
  const arquivado = situacao === "ARQUIVADO";

  useAvisoAoSair(isDirty && !arquivado);

  function tratarErroDaAcao(erro: unknown) {
    if (ehErroApi(erro) && CONFLITOS_DE_SITUACAO.has(erro.codigo)) {
      avisos.informacao(mensagemDeErro(erro));
      recarregar();
      return;
    }
    avisos.erro(mensagemDeErro(erro));
  }

  function tratarErroDoFormulario(erro: unknown) {
    if (ehErroApi(erro) && erro.codigo === "TIPO_BLOQUEADO") {
      setError("tipo_resgate", { message: mensagemDeErro(erro) });
      return;
    }
    if (aplicarErrosDeCampo(erro, setError).length === 0) tratarErroDaAcao(erro);
  }

  async function salvarAlteracoes(dados: DadosBeneficio): Promise<boolean> {
    const alterados = camposAlteradosDoBeneficio(valoresDoBeneficio(beneficio), dados);
    if (Object.keys(alterados).length === 0) return true;
    try {
      reset(valoresDoBeneficio(await atualizacao.mutateAsync(alterados)));
      return true;
    } catch (erro) {
      tratarErroDoFormulario(erro);
      return false;
    }
  }

  const salvar = handleSubmit(async (dados) => {
    if (atualizacao.isPending) return;
    if (await salvarAlteracoes(dados)) avisos.sucesso("Alterações salvas.");
  });

  const publicar = handleSubmit(async (dados) => {
    if (publicacao.isPending || !(await salvarAlteracoes(dados))) return;
    try {
      await publicacao.mutateAsync();
      avisos.sucesso("Benefício publicado.");
    } catch (erro) {
      tratarErroDaAcao(erro);
    }
  });

  function confirmarSituacao() {
    const acao = confirmando === "arquivar" ? arquivamento : despublicacao;
    const mensagem =
      confirmando === "arquivar" ? "Benefício arquivado." : "Benefício despublicado.";
    acao.mutate(undefined, {
      onSuccess: () => avisos.sucesso(mensagem),
      onError: tratarErroDaAcao,
      onSettled: () => setConfirmando(null),
    });
  }

  function duplicar() {
    duplicacao.mutate(id, {
      onSuccess: (novo) => {
        avisos.sucesso("Rascunho criado a partir do benefício arquivado");
        roteador.push(`/admin/beneficios/${novo.id_beneficio}`);
      },
      onError: tratarErroDaAcao,
    });
  }

  return (
    <FormProvider {...formulario}>
      <CabecalhoPagina
        titulo="Editar benefício"
        acoes={
          <div className="flex items-center gap-3">
            <SeloStatus tom={rotulosSituacao[situacao].tom}>
              {rotulosSituacao[situacao].rotulo}
            </SeloStatus>
            <span className="text-corpo-pequeno text-texto-secundario">
              {textoResgates(resgates)}
            </span>
          </div>
        }
      />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <form id={ID_FORMULARIO} noValidate onSubmit={salvar} className="min-w-0">
          <fieldset disabled={arquivado} className="flex min-w-0 flex-col gap-6">
            <legend className="sr-only">Dados do benefício</legend>
            <FormularioBeneficio parceiro={beneficio.parceiro} formaResgateTravada={resgates > 0} />
          </fieldset>
        </form>
        <div className="flex flex-col gap-6">
          <CartaoPublicacao
            situacao={situacao}
            detalhes={[{ termo: "Visível para", valor: "Filiados ativos" }]}
            nota="Publicar torna o benefício visível na hora, respeitando a vigência. Toda edição posterior fica registrada na auditoria."
          >
            <AcoesPublicacao
              idFormulario={ID_FORMULARIO}
              acoes={acoesPorSituacao(situacao)}
              rotuloPublicar="Publicar benefício"
              semAlteracoes={!isDirty}
              salvando={atualizacao.isPending}
              publicando={publicacao.isPending}
              aoPublicar={() => void publicar()}
              aoDespublicar={() => setConfirmando("despublicar")}
              aoArquivar={() => setConfirmando("arquivar")}
              somenteLeitura={
                <>
                  <Alerta tom="alerta" titulo="Benefício arquivado.">
                    Para renovar a parceria, duplique-o como um novo rascunho.
                  </Alerta>
                  <Botao larguraTotal carregando={duplicacao.isPending} onClick={duplicar}>
                    Duplicar como rascunho
                  </Botao>
                </>
              }
            />
          </CartaoPublicacao>
          <PreviaCardBeneficio parceiro={beneficio.parceiro} />
        </div>
      </div>

      <DialogoConfirmacao
        aberto={confirmando === "despublicar"}
        aoFechar={() => setConfirmando(null)}
        aoConfirmar={confirmarSituacao}
        titulo="Despublicar benefício?"
        descricao="O benefício deixa de aparecer para os filiados até ser publicado de novo."
        rotuloConfirmar="Despublicar"
        carregando={despublicacao.isPending}
      />
      <DialogoConfirmacao
        aberto={confirmando === "arquivar"}
        aoFechar={() => setConfirmando(null)}
        aoConfirmar={confirmarSituacao}
        titulo="Arquivar benefício?"
        descricao="O benefício sai do ar de vez. Os resgates feitos continuam no histórico."
        rotuloConfirmar="Arquivar"
        tom="perigo"
        carregando={arquivamento.isPending}
      />
    </FormProvider>
  );
}

export function PaginaEditarBeneficio() {
  const { id } = useParams<{ id: string }>();
  const consulta = useSearchParams().toString();
  const beneficio = useBeneficioAdmin(id);
  const destinoVolta = consulta ? `/admin/beneficios?${consulta}` : "/admin/beneficios";

  function conteudo() {
    if (beneficio.isPending) {
      return <Esqueleto variante="cartao" quantidade={2} rotulo="Carregando o benefício…" />;
    }
    if (beneficioAdminNaoEncontrado(beneficio.error)) {
      return (
        <EstadoVazio
          titulo="Benefício não encontrado"
          acao={
            <Link
              href={destinoVolta}
              className={classesBotao({ variante: "secundario", tamanho: "sm" })}
            >
              Voltar para a lista de benefícios
            </Link>
          }
        />
      );
    }
    if (beneficio.isError) {
      return (
        <EstadoErro
          mensagem="Não foi possível carregar o benefício."
          aoTentarNovamente={() => void beneficio.refetch()}
        />
      );
    }
    return (
      <EdicaoBeneficio
        key={`${beneficio.data.id_beneficio}-${beneficio.data.situacao}`}
        beneficio={beneficio.data}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <LinkVoltar href={destinoVolta}>Voltar para a lista de benefícios</LinkVoltar>
      {conteudo()}
    </div>
  );
}
