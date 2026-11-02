import type { Metadata } from "next";

import { EmConstrucao } from "@/shared/layout/EmConstrucao";

export const metadata: Metadata = { title: "Vagas" };

export default function PaginaAdminVagas() {
  return <EmConstrucao titulo="Vagas" />;
}
