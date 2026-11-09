"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useParametrosUrl } from "@/shared/hooks/useParametrosUrl";
import {
  Botao,
  CabecalhoPagina,
  Cartao,
  cn,
  EstadoErro,
  EstadoVazio,
  Paginacao,
  useAvisos,
} from "@/shared/ui";
import { classesBotao } from "@/shared/ui/botao/Botao";

import { useBeneficiosAdmin, useExportarBeneficios } from "../api/beneficios-admin.queries";
import {
  consultaDaLista,
  filtrosDaUrl,
  filtrosDeExportacao,
  temFiltroAplicado,
} from "../lib/filtros-url";
import { FiltrosBeneficiosAdmin } from "./FiltrosBeneficiosAdmin";
import { IndicadoresBeneficios } from "./IndicadoresBeneficios";
import { TabelaBeneficiosAdmin } from "./TabelaBeneficiosAdmin";

const CAMPOS_DE_FILTRO = {
  q: null,
  situacao: null,
  tipo_resgate: null,
  categoria: null,
  vigencia: null,
  pagina: null,
};

export function PaginaBeneficiosAdmin() {
  const { parametros, atualizar } = useParametrosUrl();
  const avisos = useAvisos();
  const filtros = filtrosDaUrl(parametros);
  const beneficios = useBeneficiosAdmin(consultaDaLista(filtros));
  const exportacao = useExportarBeneficios();
  const [limpezas, setLimpezas] = useState(0);
  const { data, isPlaceholderData } = beneficios;

  const passouDoFim =
    data !== undefined && !isPlaceholderData && data.itens.length === 0 && filtros.pagina > 1;
  const ultimaPagina = data?.total_paginas ?? 0;

  useEffect(() => {
    if (passouDoFim) atualizar({ pagina: ultimaPagina > 1 ? ultimaPagina : null });
  }, [passouDoFim, ultimaPagina, atualizar]);

  function limparFiltros() {
    setLimpezas((atual) => atual + 1);
    atualizar(CAMPOS_DE_FILTRO);
  }

  function exportar() {
    exportacao.mutate(filtrosDeExportacao(filtros), {
      onSuccess: () => avisos.sucesso("CSV exportado"),
      onError: () => avisos.erro("Não foi possível exportar. Tente novamente."),
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Benefícios"
        subtitulo="Cadastro, vigência e acompanhamento de uso das vantagens negociadas com parceiros."
        acoes={
          <>
            <Botao
              variante="secundario"
              title="Exporta os benefícios com os filtros aplicados"
              carregando={exportacao.isPending}
              onClick={exportar}
            >
              Exportar CSV
            </Botao>
            <Link href="/admin/beneficios/novo" className={classesBotao()}>
              Novo benefício
            </Link>
          </>
        }
      />
      <IndicadoresBeneficios />
      <Cartao className="flex flex-col gap-5 p-4 md:p-6">
        <FiltrosBeneficiosAdmin
          key={limpezas}
          filtros={filtros}
          valorInicialBusca={limpezas === 0 ? filtros.q : ""}
          aoBuscar={(termo) => atualizar({ q: termo.trim(), pagina: null })}
          aoFiltrar={(campo, valor) => atualizar({ [campo]: valor, pagina: null })}
        />
        {beneficios.isError && !data ? (
          <EstadoErro
            compacto
            mensagem="Não foi possível carregar os benefícios."
            aoTentarNovamente={() => void beneficios.refetch()}
          />
        ) : (
          <div
            aria-busy={isPlaceholderData}
            className={cn("transition-opacity", isPlaceholderData && "opacity-60")}
          >
            <TabelaBeneficiosAdmin
              beneficios={data?.itens ?? []}
              carregando={beneficios.isPending}
              ordenar={filtros.ordenar}
              consultaAtual={parametros.toString()}
              aoOrdenar={(ordenar) => atualizar({ ordenar, pagina: null })}
              vazio={
                <EstadoVazio
                  titulo="Nenhum benefício encontrado"
                  acao={
                    temFiltroAplicado(filtros) && (
                      <Botao variante="secundario" tamanho="sm" onClick={limparFiltros}>
                        Limpar filtros
                      </Botao>
                    )
                  }
                />
              }
            />
          </div>
        )}
        <Paginacao
          pagina={filtros.pagina}
          totalPaginas={ultimaPagina}
          aoMudar={(destino) => atualizar({ pagina: destino > 1 ? destino : null })}
        />
      </Cartao>
    </div>
  );
}
