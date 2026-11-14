import Link from "next/link";

import { Botao } from "@/shared/ui";

export function SemCreditos({ faltam }: { faltam: number }) {
  return (
    <div className="flex w-full flex-col items-center gap-3 md:gap-5">
      <p className="max-w-130 text-corpo-pequeno text-texto-secundario">
        Faltam {faltam} {faltam === 1 ? "peça" : "peças"}. Você não tem créditos. Participe de um
        evento do capítulo: cada presença confirmada vira 1 crédito.
      </p>
      <Botao disabled className="w-full max-w-90">
        🎲 Vá a um evento para ganhar um crédito
      </Botao>
      <Link
        href="/agenda"
        className="text-corpo-pequeno font-medium text-texto-marca underline-offset-4 hover:underline"
      >
        Ver agenda
      </Link>
    </div>
  );
}
