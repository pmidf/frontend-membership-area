import Link from "next/link";

import type { ItemCatalogo } from "../tipos/conteudo";
import { GradeConteudos } from "./GradeConteudos";

type PropsSecaoResumo = {
  titulo: string;
  rotuloLink: string;
  href: string;
  itens: ItemCatalogo[];
};

export function SecaoResumo({ titulo, rotuloLink, href, itens }: PropsSecaoResumo) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-h3">{titulo}</h2>
        <Link
          href={href}
          className="text-rotulo whitespace-nowrap text-texto-marca hover:underline"
        >
          {rotuloLink}
        </Link>
      </div>
      <GradeConteudos itens={itens} />
    </section>
  );
}
