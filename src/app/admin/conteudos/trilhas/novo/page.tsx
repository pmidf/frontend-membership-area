import type { Metadata } from "next";

import { PaginaNovaTrilha } from "@/features/conteudos-admin/components/PaginaNovaTrilha";

export const metadata: Metadata = { title: "Nova trilha" };

export default function Pagina() {
  return <PaginaNovaTrilha />;
}
