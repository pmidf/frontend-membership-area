import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaEditarOportunidade } from "@/features/oportunidades-admin/components/PaginaEditarOportunidade";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = { title: "Editar vaga" };

export default function Pagina() {
  return (
    <Suspense fallback={<Esqueleto variante="cartao" quantidade={2} rotulo="Carregando a vaga…" />}>
      <PaginaEditarOportunidade />
    </Suspense>
  );
}
