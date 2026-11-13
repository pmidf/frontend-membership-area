import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaEditarConteudo } from "@/features/conteudos-admin/components/PaginaEditarConteudo";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = { title: "Editar conteúdo" };

export default function Pagina() {
  return (
    <Suspense
      fallback={<Esqueleto variante="cartao" quantidade={2} rotulo="Carregando o conteúdo…" />}
    >
      <PaginaEditarConteudo />
    </Suspense>
  );
}
