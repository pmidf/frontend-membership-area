import type { Metadata } from "next";

import { EmConstrucao } from "@/shared/layout/EmConstrucao";

export const metadata: Metadata = { title: "Clube de benefícios" };

export default function PaginaBeneficios() {
  return <EmConstrucao titulo="Clube de benefícios" />;
}
