import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaDetalheBeneficio } from "@/features/beneficios/components/PaginaDetalheBeneficio";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = { title: "Benefício" };

export default function Pagina() {
  return (
    <Suspense fallback={<Esqueleto variante="cartao" rotulo="Carregando o benefício…" />}>
      <PaginaDetalheBeneficio />
    </Suspense>
  );
}
