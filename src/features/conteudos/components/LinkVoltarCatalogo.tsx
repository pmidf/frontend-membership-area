import Link from "next/link";

import { CAMINHO_CATALOGO } from "../lib/origem-catalogo";

export function LinkVoltarCatalogo({ href = CAMINHO_CATALOGO }: { href?: string }) {
  return (
    <Link href={href} className="self-start text-rotulo text-texto-marca hover:underline">
      ‹ Voltar para o catálogo
    </Link>
  );
}
