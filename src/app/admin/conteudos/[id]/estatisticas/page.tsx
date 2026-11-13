import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaEstatisticas } from "@/features/conteudos-admin/components/PaginaEstatisticas";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = { title: "Estatísticas do conteúdo" };

export default function Pagina() {
  return (
    <Suspense
      fallback={<Esqueleto variante="cartao" quantidade={2} rotulo="Carregando as estatísticas…" />}
    >
      <PaginaEstatisticas />
    </Suspense>
  );
}
