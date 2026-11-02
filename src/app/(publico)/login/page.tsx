import type { Metadata } from "next";

import { EmConstrucao } from "@/shared/layout/EmConstrucao";

export const metadata: Metadata = { title: "Entrar" };

export default function PaginaLogin() {
  return <EmConstrucao titulo="Entrar" />;
}
