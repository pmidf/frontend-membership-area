import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaBeneficios } from "@/features/beneficios/components/PaginaBeneficios";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = { title: "Clube de benefícios" };

export default function Pagina() {
  return (
    <Suspense
      fallback={<Esqueleto variante="cartao" quantidade={6} rotulo="Carregando os benefícios…" />}
    >
      <PaginaBeneficios />
    </Suspense>
  );
}
