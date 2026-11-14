import type { Metadata } from "next";

import { PaginaNovoQuebraCabeca } from "@/features/gamificacao-admin/components/PaginaNovoQuebraCabeca";

export const metadata: Metadata = { title: "Novo quebra-cabeça" };

export default function Pagina() {
  return <PaginaNovoQuebraCabeca />;
}
