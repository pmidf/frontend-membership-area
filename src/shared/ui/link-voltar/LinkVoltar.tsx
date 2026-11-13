import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function LinkVoltar({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 self-start text-corpo-pequeno font-medium text-texto-marca underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-acao-destaque"
    >
      <ChevronLeft aria-hidden="true" className="size-4" />
      {children}
    </Link>
  );
}
