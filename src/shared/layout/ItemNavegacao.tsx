import Link from "next/link";

import { cn } from "@/shared/ui/lib/cn";

import type { ItemDeNavegacao } from "./navegacao";

type PropsItemNavegacao = {
  item: ItemDeNavegacao;
  ativo: boolean;
  aoNavegar?: () => void;
};

export function ItemNavegacao({ item, ativo, aoNavegar }: PropsItemNavegacao) {
  const { rotulo, href, icone: Icone } = item;

  return (
    <Link
      href={href}
      onClick={aoNavegar}
      aria-current={ativo ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-corpo-pequeno font-medium text-texto-inverso transition-colors hover:bg-branco/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acao-destaque",
        ativo && "bg-acao-primaria hover:bg-acao-primaria",
      )}
    >
      <Icone aria-hidden="true" className="size-5 shrink-0" />
      {rotulo}
    </Link>
  );
}
