import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaTrilhas } from "@/features/conteudos/components/PaginaTrilhas";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = { title: "Trilhas" };

export default function Pagina() {
  return (
    <Suspense
      fallback={<Esqueleto variante="cartao" quantidade={3} rotulo="Carregando as trilhas…" />}
    >
      <PaginaTrilhas />
    </Suspense>
  );
}
