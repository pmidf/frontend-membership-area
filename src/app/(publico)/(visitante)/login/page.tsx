import type { Metadata } from "next";

import { FormularioLogin } from "@/features/auth/components/FormularioLogin";

export const metadata: Metadata = { title: "Entrar" };

export default function PaginaLogin() {
  return <FormularioLogin />;
}
