import type { Metadata } from "next";
import { Suspense } from "react";

import { ConfirmacaoEmailPelaUrl } from "@/features/auth/components/confirmacao/ConfirmacaoEmail";
import { CarregandoSessao } from "@/shared/sessao/ExigeLogin";

export const metadata: Metadata = { title: "Confirmar e-mail" };

export default function PaginaConfirmarEmail() {
  return (
    <Suspense fallback={<CarregandoSessao />}>
      <ConfirmacaoEmailPelaUrl />
    </Suspense>
  );
}
