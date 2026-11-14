import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaPessoas } from "@/features/pessoas-admin/components/PaginaPessoas";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = { title: "Pessoas" };

export default function Pagina() {
  return (
    <Suspense
      fallback={<Esqueleto variante="tabela" quantidade={5} rotulo="Carregando pessoas…" />}
    >
      <PaginaPessoas />
    </Suspense>
  );
}
