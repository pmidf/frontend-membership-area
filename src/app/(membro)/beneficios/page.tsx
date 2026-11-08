import type { Metadata } from "next";

import { PaginaBeneficios } from "@/features/beneficios/components/PaginaBeneficios";

export const metadata: Metadata = { title: "Clube de benefícios" };

export default function Pagina() {
  return <PaginaBeneficios />;
}
