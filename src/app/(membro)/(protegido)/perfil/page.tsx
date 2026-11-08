import type { Metadata } from "next";

import { PaginaPerfil } from "@/features/perfil/components/PaginaPerfil";

export const metadata: Metadata = { title: "Meu perfil" };

export default function Pagina() {
  return <PaginaPerfil />;
}
