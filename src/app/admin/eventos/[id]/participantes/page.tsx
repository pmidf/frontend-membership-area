import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaParticipantesAdmin } from "@/features/agenda-admin/components/PaginaParticipantesAdmin";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = { title: "Eventos · Participantes" };

export default function Pagina() {
  return (
    <Suspense
      fallback={<Esqueleto variante="tabela" quantidade={5} rotulo="Carregando participantes…" />}
    >
      <PaginaParticipantesAdmin />
    </Suspense>
  );
}
