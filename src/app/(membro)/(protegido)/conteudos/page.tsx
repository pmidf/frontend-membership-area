import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaConteudos } from "@/features/conteudos/components/PaginaConteudos";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = { title: "Conteúdo exclusivo" };

export default function Pagina() {
  return (
    <Suspense
      fallback={<Esqueleto variante="cartao" quantidade={6} rotulo="Carregando os conteúdos…" />}
    >
      <PaginaConteudos />
    </Suspense>
  );
}
