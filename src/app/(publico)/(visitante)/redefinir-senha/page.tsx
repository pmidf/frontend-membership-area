import type { Metadata } from "next";

import { EmConstrucao } from "@/shared/layout/EmConstrucao";

export const metadata: Metadata = { title: "Redefinir senha" };

export default function PaginaRedefinirSenha() {
  return <EmConstrucao titulo="Redefinir senha" />;
}
