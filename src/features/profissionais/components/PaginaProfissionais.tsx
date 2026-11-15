"use client";

import { useState } from "react";

import { useParametrosUrl } from "@/shared/hooks/useParametrosUrl";
import { CabecalhoPagina, EstadoErro, Esqueleto } from "@/shared/ui";

import { useProfissionais } from "../api/profissionais.queries";
import { filtrosDaUrl, filtrosParaApi } from "../lib/filtros-url";
import { FaixaConviteVitrine } from "./FaixaConviteVitrine";
import { FiltrosProfissionais } from "./FiltrosProfissionais";
import { ListaProfissionais } from "./ListaProfissionais";

export function PaginaProfissionais() {
  const { parametros, atualizar } = useParametrosUrl();
  const filtros = filtrosDaUrl(parametros);
  const profissionais = useProfissionais(filtrosParaApi(filtros));
  const { data } = profissionais;
  const [limpezas, setLimpezas] = useState(0);
  const primeiraVez = limpezas === 0;

  function limparFiltros() {
    setLimpezas((atual) => atual + 1);
    atualizar({ q: null, uf: null, cidade: null, pagina: null });
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <CabecalhoPagina
        titulo="Profissionais da comunidade"
        subtitulo="Filiados do capítulo que se apresentaram para fazer networking."
      />
      <FiltrosProfissionais
        key={limpezas}
        uf={filtros.uf}
        valorInicialBusca={primeiraVez ? filtros.q : ""}
        valorInicialCidade={primeiraVez ? filtros.cidade : ""}
        aoBuscar={(termo) => atualizar({ q: termo.trim(), pagina: null })}
        aoFiltrarUf={(uf) => atualizar({ uf, pagina: null })}
        aoFiltrarCidade={(cidade) => atualizar({ cidade: cidade.trim(), pagina: null })}
      />
      <FaixaConviteVitrine />
      {data && (
        <ListaProfissionais
          lista={data}
          filtros={filtros}
          consultaAtual={parametros.toString()}
          atualizando={profissionais.isPlaceholderData}
          aoMudar={atualizar}
          aoLimparFiltros={limparFiltros}
        />
      )}
      {profissionais.isPending && (
        <Esqueleto variante="cartao" quantidade={4} rotulo="Carregando os profissionais…" />
      )}
      {profissionais.isError && !data && (
        <EstadoErro
          mensagem="Não foi possível carregar os profissionais."
          aoTentarNovamente={() => void profissionais.refetch()}
        />
      )}
    </div>
  );
}
