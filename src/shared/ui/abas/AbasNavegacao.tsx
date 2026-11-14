import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "../lib/cn";

export type LinkAba = { href: string; rotulo: ReactNode };

type PropsAbasNavegacao = {
  rotulo: string;
  links: LinkAba[];
  atual: string;
  className?: string;
};

export function AbasNavegacao({ rotulo, links, atual, className }: PropsAbasNavegacao) {
  return (
    <nav aria-label={rotulo} className={cn("border-b border-borda-padrao", className)}>
      <ul className="flex gap-6">
        {links.map((link) => {
          const ativo = link.href === atual;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "-mb-px inline-block border-b-2 px-1 pb-3 text-corpo-pequeno font-medium transition-colors focus-visible:outline-2 focus-visible:outline-acao-destaque",
                  ativo
                    ? "border-acao-primaria text-texto-marca"
                    : "border-transparent text-texto-secundario hover:text-texto-primario",
                )}
              >
                {link.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
