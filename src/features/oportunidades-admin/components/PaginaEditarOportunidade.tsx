"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { rotulosSituacaoOportunidade } from "@/features/oportunidades/lib/rotulos";
import { aplicarErrosDeCampo } from "@/shared/api/aplicar-erros-de-campo";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { useAvisoAoSair } from "@/shared/hooks/useAvisoAoSair";
import { formatarData, formatarDataCivil, formatarDataHora } from "@/shared/lib/datas";
import { EstadoErro, EstadoVazio, Esqueleto, LinkVoltar, SeloStatus, useAvisos } from "@/shared/ui";

import {
  conflitoDeSituacao,
  oportunidadeAdminNaoEncontrada,
  useAtualizarOportunidade,
  useOportunidadeAdmin,
} from "../api/oportunidades-admin.queries";
import { acoesDaEdicao, type AcaoEdicao } from "../lib/acoes-por-situacao";
import { CAMINHO_VAGAS_ADMIN, caminhoDaVaga, PARAMETRO_PREVIA } from "../lib/caminhos";
import { useAcoesVaga } from "../lib/useAcoesVaga";
import { camposAlteradosDaOportunidade, valoresDaOportunidade } from "../lib/valores-oportunidade";
import { esquemaOportunidade, type DadosOportunidade } from "../schemas/oportunidade.schema";
import type { OportunidadeAdmin } from "../tipos/oportunidade-admin";
import { AcoesVaga } from "./AcoesVaga";
import { CartaoPublicacaoVaga, type DetalhePublicacao } from "./CartaoPublicacaoVaga";
import { DialogoEncerrarVaga } from "./DialogoEncerrarVaga";
import { EstruturaFormularioOportunidade } from "./EstruturaFormularioOportunidade";
import { ModalPreviaOportunidade } from "./ModalPreviaOportunidade";

const NOTAS: Record<OportunidadeAdmin["situacao"], string> = {
  RASCUNHO:
    "Publicar coloca a vaga na vitrine na hora. Pré-visualizar e publicar salvam antes as alterações.",
  PUBLICADA: "Alterações salvas aparecem na hora para os filiados. Encerrar tira a vaga do mural.",
  ENCERRADA: "Vaga encerrada não pode mais ser editada. Duplique para divulgar de novo.",
};

function detalhesDaVaga(oportunidade: OportunidadeAdmin): DetalhePublicacao[] {
  const { data_publicacao, data_encerramento, data_encerrada, motivo_encerramento } = oportunidade;
  return [
    { termo: "Criada em", valor: formatarDataHora(oportunidade.data_criacao) },
    { termo: "Última edição", valor: formatarDataHora(oportunidade.data_atualizacao) },
    ...(data_publicacao ? [{ termo: "Publicada em", valor: formatarData(data_publicacao) }] : []),
    ...(data_encerramento && !data_encerrada
      ? [{ termo: "Encerra em", valor: formatarDataCivil(data_encerramento) }]
      : []),
    ...(data_encerrada ? [{ termo: "Encerrada em", valor: formatarData(data_encerrada) }] : []),
    ...(motivo_encerramento ? [{ termo: "Motivo", valor: motivo_encerramento }] : []),
  ];
}

type PropsEdicaoOportunidade = {
  oportunidade: OportunidadeAdmin;
  abrirPrevia: boolean;
  consulta: string;
};

function EdicaoOportunidade({ oportunidade, abrirPrevia, consulta }: PropsEdicaoOportunidade) {
  const { id_oportunidade: id, situacao } = oportunidade;
  const roteador = useRouter();
  const avisos = useAvisos();
  const atualizacao = useAtualizarOportunidade(id);
  const acoesVaga = useAcoesVaga();
  const [acao, setAcao] = useState<AcaoEdicao | null>(null);
  const [previsualizando, setPrevisualizando] = useState(abrirPrevia);
  const [confirmandoEncerramento, setConfirmandoEncerramento] = useState(false);
  const formulario = useForm<DadosOportunidade>({
    resolver: zodResolver(esquemaOportunidade),
    defaultValues: valoresDaOportunidade(oportunidade),
  });
  const {
    handleSubmit,
    setError,
    reset,
    formState: { isDirty },
  } = formulario;
  const encerrada = situacao === "ENCERRADA";
  const { rotulo, tom } = rotulosSituacaoOportunidade[situacao];

  useAvisoAoSair(isDirty && !encerrada);

  useEffect(() => {
    if (abrirPrevia) roteador.replace(caminhoDaVaga(id, consulta));
  }, [abrirPrevia, roteador, id, consulta]);

  async function salvarAlteracoes(dados: DadosOportunidade): Promise<boolean> {
    const alterados = camposAlteradosDaOportunidade(valoresDaOportunidade(oportunidade), dados);
    if (Object.keys(alterados).length === 0) return true;
    try {
      reset(valoresDaOportunidade(await atualizacao.mutateAsync(alterados)));
      return true;
    } catch (erro) {
      if (aplicarErrosDeCampo(erro, setError).length > 0) return false;
      if (conflitoDeSituacao(erro)) avisos.informacao(mensagemDeErro(erro));
      else avisos.erro(mensagemDeErro(erro));
      return false;
    }
  }

  function depoisDeSalvar(acaoEscolhida: AcaoEdicao, continuar: () => Promise<unknown> | void) {
    return handleSubmit(async (dados) => {
      if (acao) return;
      setAcao(acaoEscolhida);
      if (await salvarAlteracoes(dados)) await continuar();
      setAcao(null);
    });
  }

  async function executarSemSalvar(acaoEscolhida: AcaoEdicao, executar: () => Promise<unknown>) {
    if (acao) return;
    setAcao(acaoEscolhida);
    await executar();
    setAcao(null);
  }

  const salvar = depoisDeSalvar("salvar", () =>
    avisos.sucesso(situacao === "RASCUNHO" ? "Rascunho salvo" : "Vaga atualizada"),
  );
  const previsualizar = depoisDeSalvar("previsualizar", () => setPrevisualizando(true));
  const publicar = depoisDeSalvar("publicar", () => acoesVaga.publicar(id));

  function encerrar(motivo: string | undefined) {
    void executarSemSalvar("encerrar", async () => {
      await acoesVaga.encerrar(id, motivo);
      setConfirmandoEncerramento(false);
    });
  }

  return (
    <FormProvider {...formulario}>
      <EstruturaFormularioOportunidade
        titulo="Edição de vaga"
        destinoVolta={consulta ? `${CAMINHO_VAGAS_ADMIN}?${consulta}` : CAMINHO_VAGAS_ADMIN}
        acoesCabecalho={<SeloStatus tom={tom}>{rotulo}</SeloStatus>}
        aoEnviar={salvar}
        bloqueado={encerrada}
        lateral={
          <CartaoPublicacaoVaga
            situacao={situacao}
            detalhes={detalhesDaVaga(oportunidade)}
            nota={NOTAS[situacao]}
          >
            <AcoesVaga
              acoes={acoesDaEdicao(situacao)}
              emAndamento={acao}
              semAlteracoes={!isDirty}
              aoPrevisualizar={() => void previsualizar()}
              aoPublicar={() => void publicar()}
              aoEncerrar={() => setConfirmandoEncerramento(true)}
              aoDuplicar={() => void executarSemSalvar("duplicar", () => acoesVaga.duplicar(id))}
            />
          </CartaoPublicacaoVaga>
        }
      />
      <ModalPreviaOportunidade
        id={id}
        aberto={previsualizando}
        aoFechar={() => setPrevisualizando(false)}
      />
      <DialogoEncerrarVaga
        titulo={confirmandoEncerramento ? oportunidade.titulo : null}
        carregando={acoesVaga.encerrando}
        aoFechar={() => setConfirmandoEncerramento(false)}
        aoConfirmar={encerrar}
      />
    </FormProvider>
  );
}

export function PaginaEditarOportunidade() {
  const { id } = useParams<{ id: string }>();
  const parametros = new URLSearchParams(useSearchParams().toString());
  const abrirPrevia = parametros.get(PARAMETRO_PREVIA) === "1";
  parametros.delete(PARAMETRO_PREVIA);
  const consulta = parametros.toString();
  const oportunidade = useOportunidadeAdmin(id);

  if (oportunidade.isPending) {
    return <Esqueleto variante="cartao" quantidade={2} rotulo="Carregando a vaga…" />;
  }
  if (oportunidade.isError) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <LinkVoltar href={CAMINHO_VAGAS_ADMIN}>Voltar para vagas</LinkVoltar>
        {oportunidadeAdminNaoEncontrada(oportunidade.error) ? (
          <EstadoVazio titulo="Vaga não encontrada" />
        ) : (
          <EstadoErro
            mensagem="Não foi possível carregar a vaga."
            aoTentarNovamente={() => void oportunidade.refetch()}
          />
        )}
      </div>
    );
  }
  return (
    <EdicaoOportunidade
      key={`${oportunidade.data.id_oportunidade}-${oportunidade.data.situacao}`}
      oportunidade={oportunidade.data}
      abrirPrevia={abrirPrevia}
      consulta={consulta}
    />
  );
}
