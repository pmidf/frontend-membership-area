import type { Metadata } from "next";

import { EmConstrucao } from "@/shared/layout/EmConstrucao";

export const metadata: Metadata = { title: "Comunidade" };

export default function PaginaProfissionais() {
  return <EmConstrucao titulo="Comunidade" />;
}
