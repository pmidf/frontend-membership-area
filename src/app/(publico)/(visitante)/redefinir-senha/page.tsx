import type { Metadata } from "next";
import { Suspense } from "react";

import { RedefinicaoSenhaPelaUrl } from "@/features/auth/components/senha/RedefinicaoSenha";
import { Esqueleto } from "@/shared/ui";

export const metadata: Metadata = { title: "Redefinir senha" };

export default function PaginaRedefinirSenha() {
  return (
    <Suspense fallback={<Esqueleto variante="cartao" rotulo="Validando o link…" />}>
      <RedefinicaoSenhaPelaUrl />
    </Suspense>
  );
}
