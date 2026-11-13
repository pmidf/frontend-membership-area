import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaConteudosAdmin } from "@/features/conteudos-admin/components/PaginaConteudosAdmin";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = { title: "Conteúdo" };

export default function Pagina() {
  return (
    <Suspense
      fallback={<Esqueleto variante="tabela" quantidade={5} rotulo="Carregando conteúdos…" />}
    >
      <PaginaConteudosAdmin />
    </Suspense>
  );
}
