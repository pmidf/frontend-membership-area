import type { GrupoCatalogo } from "../tipos/conteudo";
import { GradeConteudos } from "./GradeConteudos";

export function SecaoCategoria({ grupo: { desc_categoria, itens } }: { grupo: GrupoCatalogo }) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-h3">{desc_categoria}</h2>
      <GradeConteudos itens={itens} />
    </section>
  );
}
