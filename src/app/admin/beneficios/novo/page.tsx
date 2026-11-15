import type { Metadata } from "next";

import { PaginaNovoBeneficio } from "@/features/beneficios-admin/components/PaginaNovoBeneficio";

export const metadata: Metadata = { title: "Novo benefício" };

export default function Pagina() {
  return <PaginaNovoBeneficio />;
}
