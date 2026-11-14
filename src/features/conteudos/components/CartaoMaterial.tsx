import { FileText } from "lucide-react";

import type { ConteudoAcessivel } from "../tipos/conteudo";
import { BotaoAbrirMaterial } from "./BotaoAbrirMaterial";

export function CartaoMaterial({ conteudo }: { conteudo: ConteudoAcessivel }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg bg-linear-148 from-aqua-600 to-violeta-800 to-70% px-6 py-10 text-center">
      <span className="flex size-19 items-center justify-center rounded-pill bg-branco">
        <FileText aria-hidden="true" className="size-7 text-aqua-600" />
      </span>
      <p className="text-corpo-pequeno text-texto-inverso">Material de apoio do capítulo</p>
      <BotaoAbrirMaterial idConteudo={conteudo.id_conteudo} />
    </div>
  );
}
