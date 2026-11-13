import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaHistorico } from "@/features/conteudos/components/PaginaHistorico";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = { title: "Histórico" };

export default function Pagina() {
  return (
    <Suspense
      fallback={<Esqueleto variante="cartao" quantidade={6} rotulo="Carregando os conteúdos…" />}
    >
      <PaginaHistorico />
    </Suspense>
  );
}
