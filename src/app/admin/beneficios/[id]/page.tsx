import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaEditarBeneficio } from "@/features/beneficios-admin/components/PaginaEditarBeneficio";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = { title: "Editar benefício" };

export default function Pagina() {
  return (
    <Suspense
      fallback={<Esqueleto variante="cartao" quantidade={2} rotulo="Carregando o benefício…" />}
    >
      <PaginaEditarBeneficio />
    </Suspense>
  );
}
