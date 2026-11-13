import { Cartao, Etiqueta } from "@/shared/ui";

import { legendaConteudo } from "../lib/legenda-conteudo";
import type { ConteudoAcessivel } from "../tipos/conteudo";

export function InfoConteudo({ conteudo }: { conteudo: ConteudoAcessivel }) {
  const { titulo, descricao, bol_exclusivo, categoria } = conteudo;

  return (
    <Cartao className="flex flex-col items-start gap-3 p-5.5">
      <div className="flex flex-wrap gap-2">
        <Etiqueta tom={bol_exclusivo ? "aqua" : "neutro"}>
          {bol_exclusivo ? "Exclusivo filiado" : "Público"}
        </Etiqueta>
        <Etiqueta>{categoria.desc_categoria}</Etiqueta>
      </div>
      <h1 className="text-h2 break-words md:text-display">{titulo}</h1>
      <p className="text-corpo-pequeno text-texto-secundario">{legendaConteudo(conteudo)}</p>
      <p className="break-words whitespace-pre-line text-texto-secundario">{descricao}</p>
    </Cartao>
  );
}
