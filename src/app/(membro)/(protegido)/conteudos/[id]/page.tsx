import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaDetalheConteudo } from "@/features/conteudos/components/PaginaDetalheConteudo";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = { title: "Conteúdo" };

export default function Pagina() {
  return (
    <Suspense fallback={<Esqueleto variante="cartao" rotulo="Carregando o conteúdo…" />}>
      <PaginaDetalheConteudo />
    </Suspense>
  );
}
