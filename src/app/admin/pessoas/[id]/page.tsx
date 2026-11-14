import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaDetalhePessoa } from "@/features/pessoas-admin/components/PaginaDetalhePessoa";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = { title: "Detalhe da pessoa" };

export default function Pagina() {
  return (
    <Suspense
      fallback={<Esqueleto variante="cartao" quantidade={2} rotulo="Carregando a pessoa…" />}
    >
      <PaginaDetalhePessoa />
    </Suspense>
  );
}
