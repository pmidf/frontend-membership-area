import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogoComponentes } from "@/features/catalogo-componentes/components/CatalogoComponentes";

export const metadata: Metadata = {
  title: "Componentes · Área de Membros PMI-DF",
  robots: { index: false, follow: false },
};

export default function PaginaComponentes() {
  if (process.env.EXIBIR_COMPONENTES !== "true") notFound();

  return <CatalogoComponentes />;
}
