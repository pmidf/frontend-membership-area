import { Check } from "lucide-react";
import Link from "next/link";

import { formatarData } from "@/shared/lib/datas";
import { Etiqueta } from "@/shared/ui";

import { duracaoEmMinutos } from "../lib/duracao";
import { ehNovo } from "../lib/eh-novo";
import type { ItemCatalogoCompleto } from "../tipos/conteudo";
import { EstruturaCartaoConteudo } from "./EstruturaCartaoConteudo";

function legenda({ duracao_segundos, data_publicacao }: ItemCatalogoCompleto): string {
  return [
    duracao_segundos !== null && duracaoEmMinutos(duracao_segundos),
    data_publicacao && `publicado em ${formatarData(data_publicacao)}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function CartaoConteudo({ item }: { item: ItemCatalogoCompleto }) {
  const { id_conteudo, titulo, tipo, duracao_segundos, data_publicacao, consumido } = item;
  const novo = ehNovo(data_publicacao);

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
          href={`/conteudos/${id_conteudo}`}
          className="after:absolute after:inset-0 focus-visible:outline-none"
        >
          {titulo}
        </Link>
      </h3>
      <p className="text-legenda text-texto-secundario">{legenda(item)}</p>
    </EstruturaCartaoConteudo>
  );
}
