import type { Metadata } from "next";
import { Suspense } from "react";

import { PaginaPerfilProfissional } from "@/features/profissionais/components/PaginaPerfilProfissional";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = {
  title: "Perfil profissional",
  robots: { index: false, follow: false },
};

export default function Pagina() {
  return (
    <Suspense
      fallback={<Esqueleto variante="cartao" quantidade={1} rotulo="Carregando o perfil…" />}
    >
      <PaginaPerfilProfissional />
    </Suspense>
  );
}
