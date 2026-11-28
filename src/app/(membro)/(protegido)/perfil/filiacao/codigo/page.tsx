import type { Metadata } from "next";

import { PaginaCodigoPmi } from "@/features/filiacao/components/PaginaCodigoPmi";

export const metadata: Metadata = { title: "Confirmar e-mail do PMI" };

export default function Pagina() {
  return <PaginaCodigoPmi />;
}
