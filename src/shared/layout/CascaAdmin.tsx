"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Casca } from "./Casca";
import { itensAdmin } from "./navegacao";

function RotuloConsole() {
  return (
    <p className="px-3 text-legenda font-medium tracking-wide text-acao-destaque uppercase">
      Console administrativo
    </p>
  );
}

function VoltarAreaMembro({ aoNavegar }: { aoNavegar?: () => void }) {
  return (
    <Link
      href="/inicio"
      onClick={aoNavegar}
      className="flex items-center gap-3 rounded-md bg-violeta-800 p-4 text-corpo-pequeno font-medium text-texto-inverso hover:bg-violeta-800/70 focus-visible:outline-2 focus-visible:outline-acao-destaque"
    >
      <ChevronLeft aria-hidden="true" className="size-5 shrink-0" />
      Voltar à área do membro
    </Link>
  );
}

export function CascaAdmin({ children }: { children: ReactNode }) {
  return (
    <Casca
      rotuloNavegacao="Console administrativo"
      itens={itensAdmin}
      inicio="/admin/pessoas"
      topo={<RotuloConsole />}
      rodape={(aoNavegar) => <VoltarAreaMembro aoNavegar={aoNavegar} />}
      classeBarraLateral="bg-violeta-950"
    >
      {children}
    </Casca>
  );
}
