import { ChevronLeft, ChevronRight } from "lucide-react";

import { Botao } from "../botao/Botao";
import { cn } from "../lib/cn";

type PropsPaginacao = {
  pagina: number;
  totalPaginas: number;
  aoMudar: (pagina: number) => void;
  className?: string;
};

export function Paginacao({ pagina, totalPaginas, aoMudar, className }: PropsPaginacao) {
  if (totalPaginas <= 1) return null;

  return (
    <nav
      aria-label="Paginação"
      className={cn("flex items-center justify-between gap-2 sm:gap-4", className)}
    >
      <Botao
        variante="fantasma"
        tamanho="sm"
        disabled={pagina <= 1}
        onClick={() => aoMudar(pagina - 1)}
        className="max-sm:px-2"
        icone={<ChevronLeft aria-hidden="true" className="size-4" />}
      >
        Anterior
      </Botao>
      <p aria-live="polite" className="text-corpo-pequeno whitespace-nowrap text-texto-secundario">
        Página {pagina} de {totalPaginas}
      </p>
      <Botao
        variante="fantasma"
        tamanho="sm"
        disabled={pagina >= totalPaginas}
        onClick={() => aoMudar(pagina + 1)}
        className="flex-row-reverse max-sm:px-2"
        icone={<ChevronRight aria-hidden="true" className="size-4" />}
      >
        Próxima
      </Botao>
    </nav>
  );
}
