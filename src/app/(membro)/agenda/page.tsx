import type { Metadata } from "next";

import { EmConstrucao } from "@/shared/layout/EmConstrucao";

export const metadata: Metadata = { title: "Agenda de eventos" };

export default function PaginaAgenda() {
  return <EmConstrucao titulo="Agenda de eventos" />;
}
