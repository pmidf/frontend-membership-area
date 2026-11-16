import type { Metadata } from "next";

import { PaginaQuebraCabecasAdmin } from "@/features/gamificacao-admin/components/PaginaQuebraCabecasAdmin";

export const metadata: Metadata = { title: "Quebra-cabeças" };

export default function Pagina() {
  return <PaginaQuebraCabecasAdmin />;
}
