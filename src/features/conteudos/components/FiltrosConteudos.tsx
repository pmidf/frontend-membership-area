import { CampoBusca, CampoSelecao, FiltrosChip } from "@/shared/ui";

import { TAMANHO_MAXIMO_BUSCA, type FiltrosCatalogo } from "../lib/filtros-url";
import type { CategoriaConteudo } from "../tipos/conteudo";

const opcoesTipo = [
  { valor: "", rotulo: "Tudo" },
  { valor: "VIDEO", rotulo: "Vídeos" },
  { valor: "MATERIAL", rotulo: "Materiais" },
];

type PropsFiltrosConteudos = {
  filtros: FiltrosCatalogo;
  categorias?: CategoriaConteudo[];
  atrasoBusca?: number;
  focarBusca?: boolean;
  aoMudar: (novos: Record<string, string | null>) => void;
};

export function FiltrosConteudos({
  filtros,
  categorias,
  atrasoBusca,
  focarBusca,
  aoMudar,
}: PropsFiltrosConteudos) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <CampoBusca
        rotulo="Buscar por título ou tema"
        placeholder="Buscar por título ou tema"
        valorInicial={filtros.q}
        maxLength={TAMANHO_MAXIMO_BUSCA}
        atraso={atrasoBusca}
        focoInicial={focarBusca}
        aoBuscar={(termo) => aoMudar({ q: termo.trim(), pagina: null })}
        className="lg:flex-1"
      />
      <FiltrosChip
        rotulo="Tipo de conteúdo"
        opcoes={opcoesTipo}
        selecionados={[filtros.tipo]}
        aoMudar={([tipo]) => aoMudar({ tipo, pagina: null })}
        className="lg:shrink-0 lg:flex-nowrap"
      />
      {categorias && (
        <CampoSelecao
          rotulo={<span className="sr-only">Categoria</span>}
          opcoes={categorias.map(({ cod_categoria, desc_categoria }) => ({
            valor: cod_categoria,
            rotulo: desc_categoria,
          }))}
          textoVazio="Todas as categorias"
          value={filtros.categoria}
          onChange={(evento) => aoMudar({ categoria: evento.target.value, pagina: null })}
          className="gap-0 lg:w-56"
        />
      )}
    </div>
  );
}
