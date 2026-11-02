import { LinkIcon } from "lucide-react";
import Link from "next/link";

import { classesBotao } from "@/shared/ui/botao/Botao";

export function LinkInvalido() {
  return (
    <div className="flex flex-col gap-6">
      <span className="flex size-12 items-center justify-center rounded-pill bg-violeta-50">
        <LinkIcon aria-hidden="true" className="size-6 text-texto-marca" />
      </span>
      <header className="flex flex-col gap-2">
        <h1 className="text-h2">Este link não vale mais</h1>
        <p className="text-texto-secundario">
          O link expirou ou já foi usado. Peça um novo para redefinir sua senha.
        </p>
      </header>
      <Link href="/esqueci-senha" className={classesBotao({ larguraTotal: true })}>
        Pedir novo link
      </Link>
    </div>
  );
}
