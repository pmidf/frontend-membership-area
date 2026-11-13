import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaBiblioteca } from "@/features/conteudos/components/PaginaBiblioteca";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = { title: "Biblioteca completa" };

export default function Pagina() {
  return (
    <Suspense
      fallback={<Esqueleto variante="cartao" quantidade={6} rotulo="Carregando os conteúdos…" />}
    >
      <PaginaBiblioteca />
    </Suspense>
  );
}
