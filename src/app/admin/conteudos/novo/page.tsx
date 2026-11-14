import type { Metadata } from "next";

import { PaginaNovoConteudo } from "@/features/conteudos-admin/components/PaginaNovoConteudo";

export const metadata: Metadata = { title: "Novo conteúdo" };

export default function Pagina() {
  return <PaginaNovoConteudo />;
}
