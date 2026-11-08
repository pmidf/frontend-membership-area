import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/shared/ui/lib/cn";

import { ItemNavegacao } from "./ItemNavegacao";
import { estaAtivo, type ItemDeNavegacao } from "./navegacao";

type PropsBarraLateral = {
  rotulo: string;
  itens: ItemDeNavegacao[];
  caminhoAtual: string | null;
  inicio: string;
  topo?: ReactNode;
  rodape?: ReactNode;
  aoNavegar?: () => void;
  className?: string;
};

export function BarraLateral({
  rotulo,
  itens,
  caminhoAtual,
  inicio,
  topo,
  rodape,
  aoNavegar,
  className,
}: PropsBarraLateral) {
  return (
    <aside
      className={cn(
        "flex h-full w-65 flex-col gap-6 overflow-y-auto bg-violeta-800 p-5",
        className,
      )}
    >
      <Link
        href={inicio}
        onClick={aoNavegar}
        className="flex w-fit rounded-md bg-branco px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acao-destaque"
      >
        <Image src="/brand/logo-pmi-df.png" alt="PMI Distrito Federal" width={160} height={44} />
      </Link>
      {topo}
      <nav aria-label={rotulo} className="flex-1">
        <ul className="flex flex-col gap-1">
          {itens.map((item) => (
            <li key={item.href}>
              <ItemNavegacao
                item={item}
                ativo={estaAtivo(item.href, caminhoAtual)}
                aoNavegar={aoNavegar}
              />
            </li>
          ))}
        </ul>
      </nav>
      {rodape}
    </aside>
  );
}
