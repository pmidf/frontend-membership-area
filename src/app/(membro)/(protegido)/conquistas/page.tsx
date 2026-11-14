import type { Metadata } from "next";

import { EmConstrucao } from "@/shared/layout/EmConstrucao";

export const metadata: Metadata = { title: "Minhas conquistas" };

export default function PaginaConquistas() {
  return <EmConstrucao titulo="Minhas conquistas" />;
}
