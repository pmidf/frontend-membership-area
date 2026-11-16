"use client";

import { useCorrigirPaginaInexistente } from "@/shared/hooks/useCorrigirPaginaInexistente";
import { Botao, Cartao, cn, EstadoVazio, Paginacao } from "@/shared/ui";

import type { FiltrosProfissionais } from "../lib/filtros-url";
import type { ListaProfissionais as Lista } from "../tipos/profissional";
import { LinhaProfissional } from "./LinhaProfissional";

type PropsListaProfissionais = {
  lista: Lista;
  filtros: FiltrosProfissionais;
  consultaAtual: string;
  atualizando: boolean;
  aoMudar: (novos: Record<string, string | number | null>) => void;
  aoLimparFiltros: () => void;
};

const textoTotal = (total: number) => (total === 1 ? "1 profissional" : `${total} profissionais`);

export function ListaProfissionais({
  lista,
  filtros,
  consultaAtual,
  atualizando,
  aoMudar,
  aoLimparFiltros,
}: PropsListaProfissionais) {
  const temFiltro = filtros.q !== "" || filtros.uf !== "" || filtros.cidade !== "";

  useCorrigirPaginaInexistente(
    !atualizando && lista.itens.length === 0 && filtros.pagina > 1,
    lista.total_paginas,
    aoMudar,
  );

  return (
    <Cartao
      aria-busy={atualizando}
      className={cn(
        "flex flex-col gap-4 p-4 transition-opacity md:p-6",
        atualizando && "opacity-60",
      )}
    >
      <h2 className="text-h3">{textoTotal(lista.total)}</h2>
      {lista.itens.length === 0 ? (
        <EstadoVazio
          titulo="Nenhum profissional encontrado"
          descricao={
            temFiltro
              ? "Tente outro termo, outra UF ou outra cidade."
              : "Os filiados que ativarem a exibição do perfil aparecem aqui."
          }
          acao={
            temFiltro && (
              <Botao variante="secundario" tamanho="sm" onClick={aoLimparFiltros}>
                Limpar filtros
              </Botao>
            )
          }
        />
      ) : (
        <ul aria-label="Profissionais da comunidade" className="flex flex-col gap-1">
          {lista.itens.map((profissional) => (
            <LinhaProfissional
              key={profissional.id_pessoa}
              profissional={profissional}
              consultaAtual={consultaAtual}
            />
          ))}
        </ul>
      )}
      <Paginacao
        pagina={filtros.pagina}
        totalPaginas={lista.total_paginas}
        aoMudar={(destino) => aoMudar({ pagina: destino > 1 ? destino : null })}
      />
    </Cartao>
  );
}
