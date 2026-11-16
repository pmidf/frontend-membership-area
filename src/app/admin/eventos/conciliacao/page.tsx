import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaConciliacaoAdmin } from "@/features/agenda-admin/components/PaginaConciliacaoAdmin";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = { title: "Eventos · Conciliação" };

export default function Pagina() {
  return (
    <Suspense
      fallback={<Esqueleto variante="cartao" quantidade={2} rotulo="Carregando a conciliação…" />}
    >
      <PaginaConciliacaoAdmin />
    </Suspense>
  );
}
