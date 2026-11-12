import type { ItemCatalogo } from "../tipos/conteudo";
import { CartaoConteudo } from "./CartaoConteudo";
import { CartaoConteudoBloqueado } from "./CartaoConteudoBloqueado";

export function GradeConteudos({ itens }: { itens: ItemCatalogo[] }) {
  return (
    <ul className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {itens.map((item) => (
        <li key={item.id_conteudo}>
          {item.bloqueado ? (
            <CartaoConteudoBloqueado item={item} />
          ) : (
            <CartaoConteudo item={item} />
          )}
        </li>
      ))}
    </ul>
  );
}
