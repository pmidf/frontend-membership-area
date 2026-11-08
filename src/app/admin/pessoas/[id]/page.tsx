import type { Metadata } from "next";

import { EmConstrucao } from "@/shared/layout/EmConstrucao";

export const metadata: Metadata = { title: "Detalhe da pessoa" };

export default function Pagina() {
  return <EmConstrucao titulo="Detalhe da pessoa" />;
}
