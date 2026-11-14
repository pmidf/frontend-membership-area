import type { Metadata } from "next";

import { EsqueciSenha } from "@/features/auth/components/senha/EsqueciSenha";

export const metadata: Metadata = { title: "Esqueci minha senha" };

export default function PaginaEsqueciSenha() {
  return <EsqueciSenha />;
}
