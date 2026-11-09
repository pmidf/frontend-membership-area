"use client";

import { useParametrosUrl } from "@/shared/hooks/useParametrosUrl";
import { CabecalhoPagina, EstadoErro, Esqueleto } from "@/shared/ui";

import { useBeneficios } from "../api/beneficios.queries";
import { ehPrevia } from "../lib/eh-previa";
import { filtrosDaUrl, filtrosParaApi } from "../lib/filtros-url";
import { CatalogoBeneficios } from "./CatalogoBeneficios";
import { MeusResgates } from "./MeusResgates";
import { PreviaClube } from "./PreviaClube";

function subtitulo(total: number): string {
  const vantagens =
    total === 1 ? "1 vantagem ativa, negociada" : `${total} vantagens ativas, negociadas`;
  return `${vantagens} pelo capítulo. O resgate é registrado no seu histórico.`;
}

export function PaginaBeneficios() {
  const { parametros, atualizar } = useParametrosUrl();
  const filtros = filtrosDaUrl(parametros);
  const beneficios = useBeneficios(filtrosParaApi(filtros));
  const semFiltros = useBeneficios();
  const { data } = beneficios;
  const total = semFiltros.data?.total;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Clube de benefícios"
        subtitulo={total === undefined ? undefined : subtitulo(total)}
      />
      {data &&
        (ehPrevia(data) ? (
          <PreviaClube previa={data} />
        ) : (
          <CatalogoBeneficios
            lista={data}
            filtros={filtros}
            consultaAtual={parametros.toString()}
            atualizando={beneficios.isPlaceholderData}
            aoMudar={atualizar}
          />
        ))}
      {data && <MeusResgates />}
      {beneficios.isPending && (
        <Esqueleto
          variante="cartao"
          quantidade={6}
          rotulo="Carregando os benefícios…"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        />
      )}
      {beneficios.isError && !data && (
        <EstadoErro
          mensagem="Não foi possível carregar os benefícios."
          aoTentarNovamente={() => void beneficios.refetch()}
        />
      )}
    </div>
  );
}
