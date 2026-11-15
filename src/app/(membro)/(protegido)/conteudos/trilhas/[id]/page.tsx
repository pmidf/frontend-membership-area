import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaTrilha } from "@/features/conteudos/components/PaginaTrilha";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = { title: "Trilha" };

export default function Pagina() {
  return (
    <Suspense
      fallback={<Esqueleto variante="cartao" quantidade={2} rotulo="Carregando a trilha…" />}
    >
      <PaginaTrilha />
    </Suspense>
  );
}
