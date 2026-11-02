import type { Metadata } from "next";

import { EmConstrucao } from "@/shared/layout/EmConstrucao";

export const metadata: Metadata = { title: "Benefícios" };

export default function PaginaAdminBeneficios() {
  return <EmConstrucao titulo="Benefícios" />;
}
