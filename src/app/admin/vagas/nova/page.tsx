import type { Metadata } from "next";

import { PaginaNovaOportunidade } from "@/features/oportunidades-admin/components/PaginaNovaOportunidade";

export const metadata: Metadata = { title: "Nova vaga" };

export default function Pagina() {
  return <PaginaNovaOportunidade />;
}
