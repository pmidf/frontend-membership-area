"use client";

import { formatarDataHora } from "@/shared/lib/datas";
import { Avatar, Botao, Cartao, EstadoErro, EstadoVazio, Esqueleto, useAvisos } from "@/shared/ui";

import { useAcessos, useExportarAcessos } from "../api/estatisticas.queries";

function legenda(espectadores: number, acessos: number): string {
  const pessoas =
    espectadores === 1 ? "1 pessoa já acessou" : `${espectadores} pessoas já acessaram`;
  return `${pessoas} este conteúdo · ${acessos === 1 ? "1 acesso" : `${acessos} acessos`}`;
}

export function ListaAcessos({ id }: { id: string }) {
  const avisos = useAvisos();
  const acessos = useAcessos(id);
  const exportacao = useExportarAcessos(id);
  const primeira = acessos.data?.pages[0];
  const itens = acessos.data?.pages.flatMap((pagina) => pagina.acessos) ?? [];

  function exportar() {
    exportacao.mutate(undefined, {
      onSuccess: () => avisos.sucesso("CSV exportado"),
      onError: () => avisos.erro("Não foi possível exportar. Tente novamente."),
    });
  }

  function corpo() {
    if (acessos.isPending)
      return <Esqueleto variante="linha" quantidade={4} rotulo="Carregando os acessos…" />;
    if (acessos.isError && !primeira) {
      return (
        <EstadoErro
          compacto
          mensagem="Não foi possível carregar os acessos."
          aoTentarNovamente={() => void acessos.refetch()}
        />
      );
    }
    if (itens.length === 0) return <EstadoVazio titulo="Ninguém acessou este conteúdo ainda" />;
    return (
      <>
        <ul aria-label="Pessoas que acessaram" className="flex flex-col">
          {itens.map(({ nome, cargo, empresa, data_acesso }, indice) => (
            <li
              key={`${data_acesso}-${indice}`}
              className="flex flex-col gap-2 border-b border-borda-padrao py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="flex min-w-0 items-center gap-3">
                <Avatar nome={nome} tamanho="md" />
                <span className="flex min-w-0 flex-col">
                  <span className="font-medium break-words">{nome}</span>
                  <span className="text-corpo-pequeno break-words text-texto-secundario">
                    {[cargo, empresa].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </span>
              <span className="text-corpo-pequeno text-texto-secundario sm:shrink-0">
                {formatarDataHora(data_acesso)}
              </span>
            </li>
          ))}
        </ul>
        {acessos.hasNextPage && (
          <Botao
            variante="secundario"
            tamanho="sm"
            className="self-center"
            carregando={acessos.isFetchingNextPage}
            onClick={() => void acessos.fetchNextPage()}
          >
            Carregar mais
          </Botao>
        )}
      </>
    );
  }

  return (
    <Cartao className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-h3">Quem acessou</h2>
          {primeira && (
            <p className="text-corpo-pequeno text-texto-secundario">
              {legenda(primeira.total_espectadores, primeira.total_acessos)}
            </p>
          )}
        </div>
        <Botao
          variante="secundario"
          carregando={exportacao.isPending}
          disabled={itens.length === 0}
          onClick={exportar}
        >
          Exportar CSV
        </Botao>
      </div>
      {corpo()}
    </Cartao>
  );
}
