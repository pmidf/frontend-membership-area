"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { rotulosSituacaoOportunidade } from "@/features/oportunidades/lib/rotulos";
import { aplicarErrosDeCampo } from "@/shared/api/aplicar-erros-de-campo";
import { mensagemDeErro } from "@/shared/api/mensagens-erro";
import { useAvisoAoSair } from "@/shared/hooks/useAvisoAoSair";
import { formatarData, formatarDataHora } from "@/shared/lib/datas";
import { CartaoPublicacao } from "@/shared/publicacao/CartaoPublicacao";
import {
  Alerta,
  EstadoErro,
  EstadoVazio,
  Esqueleto,
  LinkVoltar,
  SeloStatus,
  useAvisos,
} from "@/shared/ui";

import {
  oportunidadeAdminNaoEncontrada,
  useAtualizarOportunidade,
  useOportunidadeAdmin,
  usePublicarOportunidade,
} from "../api/oportunidades-admin.queries";
import { camposAlteradosDaOportunidade, valoresDaOportunidade } from "../lib/valores-oportunidade";
import { esquemaOportunidade, type DadosOportunidade } from "../schemas/oportunidade.schema";
import type { OportunidadeAdmin } from "../tipos/oportunidade-admin";
import { AcoesRascunho, type AcaoRascunho } from "./AcoesRascunho";
import {
  CAMINHO_VAGAS_ADMIN,
  EstruturaFormularioOportunidade,
  PARAMETRO_PREVIA,
} from "./EstruturaFormularioOportunidade";
import { ModalPreviaOportunidade } from "./ModalPreviaOportunidade";

function AvisoSomenteLeitura({ oportunidade }: { oportunidade: OportunidadeAdmin }) {
  if (oportunidade.situacao === "ENCERRADA") {
    return (
      <Alerta tom="alerta" titulo="Vaga encerrada">
        Ela saiu da vitrine e não pode mais ser editada.
      </Alerta>
    );
  }
  return (
    <Alerta tom="marca" titulo="Vaga publicada">
      {oportunidade.data_publicacao
        ? `Publicada em ${formatarData(oportunidade.data_publicacao)}. Ela já aparece para os filiados.`
        : "Ela já aparece para os filiados."}
    </Alerta>
  );
}

type PropsEdicaoOportunidade = {
  oportunidade: OportunidadeAdmin;
  abrirPrevia: boolean;
};

function EdicaoOportunidade({ oportunidade, abrirPrevia }: PropsEdicaoOportunidade) {
  const { id_oportunidade: id, situacao } = oportunidade;
  const roteador = useRouter();
  const avisos = useAvisos();
  const atualizacao = useAtualizarOportunidade(id);
  const publicacao = usePublicarOportunidade();
  const [acao, setAcao] = useState<AcaoRascunho | null>(null);
  const [previsualizando, setPrevisualizando] = useState(abrirPrevia);
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
  const rascunho = situacao === "RASCUNHO";

  useAvisoAoSair(isDirty && rascunho);

  useEffect(() => {
    if (abrirPrevia) roteador.replace(`${CAMINHO_VAGAS_ADMIN}/${id}`);
  }, [abrirPrevia, roteador, id]);

  async function salvarAlteracoes(dados: DadosOportunidade): Promise<boolean> {
    const alterados = camposAlteradosDaOportunidade(valoresDaOportunidade(oportunidade), dados);
    if (Object.keys(alterados).length === 0) return true;
    try {
      reset(valoresDaOportunidade(await atualizacao.mutateAsync(alterados)));
      return true;
    } catch (erro) {
      if (aplicarErrosDeCampo(erro, setError).length === 0) avisos.erro(mensagemDeErro(erro));
      return false;
    }
  }

  function executar(acaoEscolhida: AcaoRascunho, depoisDeSalvar: () => Promise<void> | void) {
    return handleSubmit(async (dados) => {
      if (acao) return;
      setAcao(acaoEscolhida);
      if (await salvarAlteracoes(dados)) await depoisDeSalvar();
      setAcao(null);
    });
  }

  const salvar = executar("salvar", () => avisos.sucesso("Rascunho salvo"));

  const previsualizar = executar("previsualizar", () => setPrevisualizando(true));

  const publicar = executar("publicar", async () => {
    try {
      await publicacao.mutateAsync(id);
      avisos.sucesso("Vaga publicada");
    } catch (erro) {
      avisos.erro(mensagemDeErro(erro));
    }
  });

  const { rotulo, tom } = rotulosSituacaoOportunidade[situacao];

  return (
    <FormProvider {...formulario}>
      <EstruturaFormularioOportunidade
        titulo="Edição de vaga"
        acoesCabecalho={<SeloStatus tom={tom}>{rotulo}</SeloStatus>}
        aoEnviar={salvar}
        bloqueado={!rascunho}
        lateral={
          rascunho ? (
            <CartaoPublicacao
              situacao="RASCUNHO"
              detalhes={[
                { termo: "Criada em", valor: formatarDataHora(oportunidade.data_criacao) },
                { termo: "Última edição", valor: formatarDataHora(oportunidade.data_atualizacao) },
              ]}
              nota="Publicar coloca a vaga na vitrine na hora. Pré-visualizar e publicar salvam antes as alterações."
            >
              <AcoesRascunho
                emAndamento={acao}
                semAlteracoes={!isDirty}
                aoPrevisualizar={() => void previsualizar()}
                aoPublicar={() => void publicar()}
              />
            </CartaoPublicacao>
          ) : (
            <AvisoSomenteLeitura oportunidade={oportunidade} />
          )
        }
      />
      <ModalPreviaOportunidade
        id={id}
        aberto={previsualizando}
        aoFechar={() => setPrevisualizando(false)}
      />
    </FormProvider>
  );
}

export function PaginaEditarOportunidade() {
  const { id } = useParams<{ id: string }>();
  const abrirPrevia = useSearchParams().get(PARAMETRO_PREVIA) === "1";
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
    />
  );
}
