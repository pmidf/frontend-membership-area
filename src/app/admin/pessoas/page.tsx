import type { Metadata } from "next";

import { EmConstrucao } from "@/shared/layout/EmConstrucao";

export const metadata: Metadata = { title: "Pessoas" };

export default function PaginaAdminPessoas() {
  return <EmConstrucao titulo="Pessoas" />;
}
