import type { Metadata } from "next";

import { PaginaRankingGamificacao } from "@/features/gamificacao-admin/components/PaginaRankingGamificacao";

export const metadata: Metadata = { title: "Estatísticas de gamificação" };

export default function Pagina() {
  return <PaginaRankingGamificacao />;
}
