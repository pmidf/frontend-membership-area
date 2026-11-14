import { useCorrigirPaginaInexistente } from "@/shared/hooks/useCorrigirPaginaInexistente";
import { cn, EstadoVazio, Paginacao } from "@/shared/ui";

import type { FiltrosCatalogo } from "../lib/filtros-url";
import type { Catalogo, CategoriaConteudo } from "../tipos/conteudo";
import { FiltrosConteudos } from "./FiltrosConteudos";
import { SecaoCategoria } from "./SecaoCategoria";

type PropsCatalogoConteudos = {
  catalogo: Catalogo;
  categorias: CategoriaConteudo[];
  filtros: FiltrosCatalogo;
  atualizando: boolean;
  aoMudar: (novos: Record<string, string | number | null>) => void;
};

export function CatalogoConteudos({
  catalogo,
  categorias,
  filtros,
  atualizando,
  aoMudar,
}: PropsCatalogoConteudos) {
  const semItens = catalogo.categorias.length === 0;
  useCorrigirPaginaInexistente(
    !atualizando && semItens && filtros.pagina > 1,
    catalogo.total_paginas,
    aoMudar,
  );

  return (
    <>
      <FiltrosConteudos
        filtros={filtros}
        categorias={categorias}
        focarBusca={Boolean(filtros.q)}
        aoMudar={aoMudar}
      />
      <div
        aria-busy={atualizando}
        className={cn("flex flex-col gap-6 transition-opacity", atualizando && "opacity-60")}
      >
        {semItens ? (
          <EstadoVazio titulo="Nenhum conteúdo encontrado" />
        ) : (
          catalogo.categorias.map((grupo) => (
            <SecaoCategoria key={grupo.cod_categoria} grupo={grupo} />
          ))
        )}
      </div>
      <Paginacao
        pagina={filtros.pagina}
        totalPaginas={catalogo.total_paginas}
        aoMudar={(destino) => aoMudar({ pagina: destino > 1 ? destino : null })}
      />
    </>
  );
}
