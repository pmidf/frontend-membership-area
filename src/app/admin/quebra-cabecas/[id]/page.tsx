import type { Metadata } from "next";

import { PaginaEditarQuebraCabeca } from "@/features/gamificacao-admin/components/PaginaEditarQuebraCabeca";

export const metadata: Metadata = { title: "Editar quebra-cabeça" };

export default function Pagina() {
  return <PaginaEditarQuebraCabeca />;
}
