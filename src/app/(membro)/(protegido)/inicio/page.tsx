import type { Metadata } from "next";

import { EmConstrucao } from "@/shared/layout/EmConstrucao";

export const metadata: Metadata = { title: "Início" };

export default function PaginaInicio() {
  return <EmConstrucao titulo="Início" />;
}
