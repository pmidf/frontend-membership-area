import { formatarData } from "@/shared/lib/datas";

import type { ItemCatalogo, ItemCatalogoCompleto } from "../tipos/conteudo";
import { duracaoEmMinutos } from "./duracao";
import { rotulosTipo } from "./tipo-conteudo";

export function legendaConteudo({
  duracao_segundos,
  data_publicacao,
}: Pick<ItemCatalogoCompleto, "duracao_segundos" | "data_publicacao">): string {
  return [
    duracao_segundos !== null && duracaoEmMinutos(duracao_segundos),
    data_publicacao && `publicado em ${formatarData(data_publicacao)}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function legendaCurtaConteudo(item: ItemCatalogo): string {
  if (item.bloqueado) return "Exclusivo para filiados";
  return [
    rotulosTipo[item.tipo],
    item.duracao_segundos !== null && duracaoEmMinutos(item.duracao_segundos),
  ]
    .filter(Boolean)
    .join(" · ");
}
