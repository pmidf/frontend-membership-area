import type { Metadata } from "next";

import { EmConstrucao } from "@/shared/layout/EmConstrucao";

export const metadata: Metadata = { title: "Conteúdo" };

export default function Pagina() {
  return <EmConstrucao titulo="Conteúdo" />;
}
