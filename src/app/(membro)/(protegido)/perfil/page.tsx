import type { Metadata } from "next";

import { SecaoSeguranca } from "@/features/seguranca/components/SecaoSeguranca";
import { CabecalhoPagina } from "@/shared/ui";

export const metadata: Metadata = { title: "Meu perfil" };

export default function PaginaPerfil() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <CabecalhoPagina titulo="Meu perfil" />
      <SecaoSeguranca />
    </div>
  );
}
