import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaDetalheVaga } from "@/features/oportunidades/components/PaginaDetalheVaga";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = { title: "Vaga" };

export default function Pagina() {
  return (
    <Suspense fallback={<Esqueleto variante="cartao" quantidade={2} rotulo="Carregando a vaga…" />}>
      <PaginaDetalheVaga />
    </Suspense>
  );
}
