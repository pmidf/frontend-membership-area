import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaInicio } from "@/features/inicio/components/PaginaInicio";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = { title: "Início" };

export default function Pagina() {
  return (
    <Suspense
      fallback={<Esqueleto variante="cartao" quantidade={3} rotulo="Carregando o início…" />}
    >
      <PaginaInicio />
    </Suspense>
  );
}
