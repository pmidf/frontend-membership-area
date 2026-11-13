import { Check } from "lucide-react";
import Link from "next/link";

import { Etiqueta } from "@/shared/ui";

import { ehNovo } from "../lib/eh-novo";
import { legendaConteudo } from "../lib/legenda-conteudo";
import { caminhoDoConteudo } from "../lib/origem-catalogo";
import { useOrigemAtual } from "../lib/useOrigemAtual";
import type { ItemCatalogoCompleto } from "../tipos/conteudo";
import { EstruturaCartaoConteudo } from "./EstruturaCartaoConteudo";

export function CartaoConteudo({ item }: { item: ItemCatalogoCompleto }) {
  const { id_conteudo, titulo, tipo, duracao_segundos, data_publicacao, consumido } = item;
  const novo = ehNovo(data_publicacao);
  const origem = useOrigemAtual();

  return (
    <EstruturaCartaoConteudo tipo={tipo} duracaoSegundos={duracao_segundos} interativo>
      {(novo || consumido) && (
        <div className="flex flex-wrap gap-2">
          {novo && <Etiqueta tom="aqua">Novo</Etiqueta>}
          {consumido && (
            <Etiqueta tom="sucesso">
              <Check aria-hidden="true" className="size-3" />
              Visto
            </Etiqueta>
          )}
        </div>
      )}
      <h3 className="line-clamp-2 text-corpo font-medium max-sm:font-bold">
        <Link
          href={caminhoDoConteudo(id_conteudo, origem)}
          className="after:absolute after:inset-0 focus-visible:outline-none"
        >
          {titulo}
        </Link>
      </h3>
      <p className="text-legenda text-texto-secundario">{legendaConteudo(item)}</p>
    </EstruturaCartaoConteudo>
  );
}
