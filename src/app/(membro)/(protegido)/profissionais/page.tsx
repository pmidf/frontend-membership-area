import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaProfissionais } from "@/features/profissionais/components/PaginaProfissionais";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = {
  title: "Profissionais da comunidade",
  robots: { index: false, follow: false },
};

export default function Pagina() {
  return (
    <Suspense
      fallback={
        <Esqueleto variante="cartao" quantidade={4} rotulo="Carregando os profissionais…" />
      }
    >
      <PaginaProfissionais />
    </Suspense>
  );
}
