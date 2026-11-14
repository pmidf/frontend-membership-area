import type { ItemCatalogoPrevia } from "../tipos/conteudo";
import { EstruturaCartaoConteudo } from "./EstruturaCartaoConteudo";

export function CartaoConteudoBloqueado({ item: { titulo, tipo } }: { item: ItemCatalogoPrevia }) {
  return (
    <EstruturaCartaoConteudo tipo={tipo} bloqueado>
      <h3 className="line-clamp-2 text-corpo font-medium max-sm:font-bold">{titulo}</h3>
      <span aria-hidden="true" className="h-3 w-2/3 rounded-sm bg-borda-padrao blur-xs" />
    </EstruturaCartaoConteudo>
  );
}
