import type { Metadata } from "next";

import { EmConstrucao } from "@/shared/layout/EmConstrucao";

export const metadata: Metadata = { title: "Evento" };

export default function PaginaDetalheEvento() {
  return <EmConstrucao titulo="Evento" />;
}
