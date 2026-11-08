import type { Metadata } from "next";

import { AssistenteCadastro } from "@/features/auth/components/cadastro/AssistenteCadastro";

export const metadata: Metadata = { title: "Criar conta" };

export default function PaginaCadastro() {
  return <AssistenteCadastro />;
}
