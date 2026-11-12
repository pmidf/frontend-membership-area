import Link from "next/link";

export function LinkVoltarCatalogo() {
  return (
    <Link href="/conteudos" className="self-start text-rotulo text-texto-marca hover:underline">
      ‹ Voltar para o catálogo
    </Link>
  );
}
