import type { Metadata } from "next";

import { EmConstrucao } from "@/shared/layout/EmConstrucao";

export const metadata: Metadata = { title: "Benefício" };

export default function PaginaDetalheBeneficio() {
  return <EmConstrucao titulo="Benefício" />;
}
