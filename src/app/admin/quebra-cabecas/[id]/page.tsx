import type { Metadata } from "next";

import { EmConstrucao } from "@/shared/layout/EmConstrucao";

export const metadata: Metadata = { title: "Editar quebra-cabeça" };

export default function Pagina() {
  return <EmConstrucao titulo="Editar quebra-cabeça" />;
}
