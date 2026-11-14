import Link from "next/link";

import { cn } from "@/shared/ui/lib/cn";

import { estaAtivo, itensMobile } from "./navegacao";

export function NavegacaoInferior({ caminhoAtual }: { caminhoAtual: string | null }) {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-borda-padrao bg-fundo-superficie pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-5">
        {itensMobile.map(({ rotulo, href, icone: Icone }) => {
          const ativo = estaAtivo(href, caminhoAtual);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={ativo ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 text-legenda text-texto-secundario focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-acao-destaque",
                  ativo && "font-medium text-acao-primaria",
                )}
              >
                <Icone aria-hidden="true" className="size-5" />
                {rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
