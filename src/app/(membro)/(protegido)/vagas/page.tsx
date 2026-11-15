import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaVagas } from "@/features/oportunidades/components/PaginaVagas";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = { title: "Vagas" };

export default function Pagina() {
  return (
    <Suspense
      fallback={<Esqueleto variante="cartao" quantidade={4} rotulo="Carregando as vagas…" />}
    >
      <PaginaVagas />
    </Suspense>
  );
}
