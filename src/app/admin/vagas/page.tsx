import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaVagasAdmin } from "@/features/oportunidades-admin/components/PaginaVagasAdmin";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = { title: "Vagas" };

export default function Pagina() {
  return (
    <Suspense
      fallback={<Esqueleto variante="tabela" quantidade={5} rotulo="Carregando as vagas…" />}
    >
      <PaginaVagasAdmin />
    </Suspense>
  );
}
