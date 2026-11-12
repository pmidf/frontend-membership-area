import type { Metadata } from "next";

import { PaginaConteudos } from "@/features/conteudos/components/PaginaConteudos";

export const metadata: Metadata = { title: "Conteúdo exclusivo" };

export default function Pagina() {
  return <PaginaConteudos />;
}
