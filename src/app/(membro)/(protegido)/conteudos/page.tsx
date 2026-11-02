import type { Metadata } from "next";

import { EmConstrucao } from "@/shared/layout/EmConstrucao";

export const metadata: Metadata = { title: "Conteúdo exclusivo" };

export default function PaginaConteudos() {
  return <EmConstrucao titulo="Conteúdo exclusivo" />;
}
