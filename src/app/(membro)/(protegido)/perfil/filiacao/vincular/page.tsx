import type { Metadata } from "next";

import { PaginaVincularFiliacao } from "@/features/filiacao/components/PaginaVincularFiliacao";

export const metadata: Metadata = { title: "Vincular filiação" };

export default function Pagina() {
  return <PaginaVincularFiliacao />;
}
