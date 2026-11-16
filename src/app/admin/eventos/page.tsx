import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaEventosAdmin } from "@/features/agenda-admin/components/PaginaEventosAdmin";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = { title: "Eventos" };

export default function Pagina() {
  return (
    <Suspense
      fallback={<Esqueleto variante="tabela" quantidade={5} rotulo="Carregando eventos…" />}
    >
      <PaginaEventosAdmin />
    </Suspense>
  );
}
