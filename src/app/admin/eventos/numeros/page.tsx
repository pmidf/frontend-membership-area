import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaNumerosAdmin } from "@/features/agenda-admin/components/PaginaNumerosAdmin";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = { title: "Eventos · Números" };

export default function Pagina() {
  return (
    <Suspense
      fallback={<Esqueleto variante="tabela" quantidade={5} rotulo="Calculando os números…" />}
    >
      <PaginaNumerosAdmin />
    </Suspense>
  );
}
