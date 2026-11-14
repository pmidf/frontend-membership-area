import { formatarData } from "@/shared/lib/datas";

import type { ItemCatalogoCompleto } from "../tipos/conteudo";
import { duracaoEmMinutos } from "./duracao";

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
