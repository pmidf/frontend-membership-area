import type { Metadata } from "next";

import { EmConstrucao } from "@/shared/layout/EmConstrucao";

export const metadata: Metadata = { title: "Eventos" };

export default function PaginaAdminEventos() {
  return <EmConstrucao titulo="Eventos" />;
}
