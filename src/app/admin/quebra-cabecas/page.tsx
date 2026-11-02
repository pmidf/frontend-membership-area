import type { Metadata } from "next";

import { EmConstrucao } from "@/shared/layout/EmConstrucao";

export const metadata: Metadata = { title: "Quebra-cabeças" };

export default function PaginaAdminQuebraCabecas() {
  return <EmConstrucao titulo="Quebra-cabeças" />;
}
