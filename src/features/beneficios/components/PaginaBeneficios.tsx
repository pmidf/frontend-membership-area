"use client";

import { EmConstrucao } from "@/shared/layout/EmConstrucao";
import { CabecalhoPagina, EstadoErro, Esqueleto } from "@/shared/ui";

import { useBeneficios } from "../api/beneficios.queries";
import { ehPrevia } from "../lib/eh-previa";
import { PreviaClube } from "./PreviaClube";

const TITULO = "Clube de benefícios";

function subtitulo(total: number): string {
  const vantagens =
    total === 1 ? "1 vantagem ativa, negociada" : `${total} vantagens ativas, negociadas`;
  return `${vantagens} pelo capítulo. O resgate é registrado no seu histórico.`;
}

export function PaginaBeneficios() {
  const beneficios = useBeneficios();
  const { data } = beneficios;

  if (data && !ehPrevia(data)) return <EmConstrucao titulo={TITULO} />;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <CabecalhoPagina titulo={TITULO} subtitulo={data && subtitulo(data.total)} />
      {data && <PreviaClube previa={data} />}
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
