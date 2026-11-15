"use client";

import { useParametrosUrl } from "@/shared/hooks/useParametrosUrl";
import { CabecalhoPagina, EstadoErro, Esqueleto } from "@/shared/ui";

import { useOportunidades } from "../api/oportunidades.queries";
import { ehPrevia } from "../lib/eh-previa";
import { filtrosDaUrl, filtrosParaApi } from "../lib/filtros-url";
import { ListaVagas } from "./ListaVagas";
import { PreviaVagas } from "./PreviaVagas";

export function PaginaVagas() {
  const { parametros, atualizar } = useParametrosUrl();
  const filtros = filtrosDaUrl(parametros);
  const vagas = useOportunidades(filtrosParaApi(filtros));
  const { data } = vagas;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Oportunidades de carreira"
        subtitulo="Vagas de gerenciamento de projetos enviadas por empresas e curadas pela Diretoria de Carreira."
      />
      {data &&
        (ehPrevia(data) ? (
          <PreviaVagas previa={data} />
        ) : (
          <ListaVagas
            lista={data}
            filtros={filtros}
            consultaAtual={parametros.toString()}
            atualizando={vagas.isPlaceholderData}
            aoMudar={atualizar}
          />
        ))}
      {vagas.isPending && (
        <Esqueleto variante="cartao" quantidade={4} rotulo="Carregando as vagas…" />
      )}
      {vagas.isError && !data && (
        <EstadoErro
          mensagem="Não foi possível carregar as vagas."
          aoTentarNovamente={() => void vagas.refetch()}
        />
      )}
    </div>
  );
}
