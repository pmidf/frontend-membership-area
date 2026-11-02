import type { Metadata } from "next";

import { EmConstrucao } from "@/shared/layout/EmConstrucao";

export const metadata: Metadata = { title: "Meu perfil" };

export default function PaginaPerfil() {
  return <EmConstrucao titulo="Meu perfil" />;
}
