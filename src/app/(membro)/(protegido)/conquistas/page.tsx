import type { Metadata } from "next";

import { PaginaConquistas } from "@/features/gamificacao/components/PaginaConquistas";

export const metadata: Metadata = { title: "Minhas conquistas" };

export default function Pagina() {
  return <PaginaConquistas />;
}
