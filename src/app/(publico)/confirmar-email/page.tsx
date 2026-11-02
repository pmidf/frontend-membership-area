import type { Metadata } from "next";

import { EmConstrucao } from "@/shared/layout/EmConstrucao";

export const metadata: Metadata = { title: "Confirmar e-mail" };

export default function PaginaConfirmarEmail() {
  return <EmConstrucao titulo="Confirmar e-mail" />;
}
