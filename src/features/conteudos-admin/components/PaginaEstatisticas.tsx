"use client";

import { useParams } from "next/navigation";

import { rotulosTipo } from "@/features/conteudos/lib/tipo-conteudo";
import { useParametrosUrl } from "@/shared/hooks/useParametrosUrl";
import { formatarData } from "@/shared/lib/datas";
import { rotulosSituacao } from "@/shared/publicacao/situacao";
import { cn, EstadoErro, EstadoVazio, Esqueleto, Indicador, LinkVoltar } from "@/shared/ui";

import { conteudoAdminNaoEncontrado } from "../api/conteudos-admin.queries";
import { useEstatisticas } from "../api/estatisticas.queries";
import { periodoDaUrl } from "../lib/periodo-estatisticas";
import type { EstatisticasConteudo } from "../tipos/conteudo-admin";
import { FiltroPeriodo } from "./FiltroPeriodo";
import { GraficoVisualizacoes } from "./GraficoVisualizacoes";
import { ListaAcessos } from "./ListaAcessos";

function legenda({ tipo, data_publicacao, situacao }: EstatisticasConteudo): string {
  return [
    "Estatísticas de acesso",
    rotulosTipo[tipo],
    data_publicacao && `publicado em ${formatarData(data_publicacao)}`,
    rotulosSituacao[situacao].rotulo,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function PaginaEstatisticas() {
  const { id } = useParams<{ id: string }>();
  const { parametros, atualizar } = useParametrosUrl();
  const { periodo, consulta } = periodoDaUrl(parametros);
  const estatisticas = useEstatisticas(id, consulta);
  const { data, isPlaceholderData } = estatisticas;

  function conteudo() {
    if (estatisticas.isPending) {
      return <Esqueleto variante="cartao" quantidade={2} rotulo="Carregando as estatísticas…" />;
    }
    if (conteudoAdminNaoEncontrado(estatisticas.error)) {
      return <EstadoVazio titulo="Conteúdo não encontrado" />;
    }
    if (!data) {
      return (
        <EstadoErro
          mensagem="Não foi possível carregar as estatísticas."
          aoTentarNovamente={() => void estatisticas.refetch()}
        />
      );
    }
    return (
      <>
        <header className="flex flex-col gap-1">
          <h1 className="text-h2 break-words md:text-display">{data.titulo}</h1>
          <p className="text-corpo-pequeno text-texto-secundario">{legenda(data)}</p>
        </header>
        <FiltroPeriodo
          key={`${periodo.de}-${periodo.ate}`}
          periodo={periodo}
          aoAplicar={(novo) => atualizar(novo)}
        />
        <div
          aria-busy={isPlaceholderData}
          className={cn(
            "flex flex-col gap-6 transition-opacity",
            isPlaceholderData && "opacity-60",
          )}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Indicador
              rotulo="Visualizações totais"
              valor={data.visualizacoes_totais}
              carregando={false}
            />
            <Indicador
              rotulo="Espectadores únicos"
              valor={data.espectadores_unicos}
              carregando={false}
            />
            <Indicador
              rotulo="Visualizações nos últimos 7 dias"
              valor={data.visualizacoes_recentes}
              carregando={false}
            />
          </div>
          <GraficoVisualizacoes serie={data.serie} periodo={periodo} />
        </div>
        <ListaAcessos id={id} />
      </>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <LinkVoltar href={`/admin/conteudos/${id}`}>Voltar para o conteúdo</LinkVoltar>
      {conteudo()}
    </div>
  );
}
