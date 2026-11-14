import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaBeneficiosAdmin } from "@/features/beneficios-admin/components/PaginaBeneficiosAdmin";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = { title: "Benefícios" };

export default function Pagina() {
  return (
    <Suspense
      fallback={<Esqueleto variante="tabela" quantidade={5} rotulo="Carregando benefícios…" />}
    >
      <PaginaBeneficiosAdmin />
    </Suspense>
  );
}
