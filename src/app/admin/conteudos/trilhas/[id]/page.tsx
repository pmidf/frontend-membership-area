import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaEditarTrilha } from "@/features/conteudos-admin/components/PaginaEditarTrilha";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = { title: "Editar trilha" };

export default function Pagina() {
  return (
    <Suspense
      fallback={<Esqueleto variante="cartao" quantidade={2} rotulo="Carregando a trilha…" />}
    >
      <PaginaEditarTrilha />
    </Suspense>
  );
}
