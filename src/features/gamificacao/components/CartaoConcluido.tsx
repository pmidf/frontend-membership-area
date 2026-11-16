import { Check } from "lucide-react";

import { formatarData } from "@/shared/lib/datas";

import type { QuebraCabecaConcluido } from "../tipos/gamificacao";
import {
  SeloPecas,
  TextoCatalogo,
  classesCartaoCatalogo,
  classesMidiaCatalogo,
} from "./CartaoCatalogo";
import { ImagemQuebraCabeca } from "./ImagemQuebraCabeca";

type PropsCartaoConcluido = {
  concluido: QuebraCabecaConcluido;
  aoAbrir: (progressoId: string) => void;
};

export function CartaoConcluido({ concluido, aoAbrir }: PropsCartaoConcluido) {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={() => aoAbrir(concluido.progresso_id)}
      className={`${classesCartaoCatalogo} cursor-pointer transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acao-destaque`}
    >
      <span className={classesMidiaCatalogo}>
        <ImagemQuebraCabeca src={concluido.imagem_original} className="size-full" />
        <SeloPecas />
      </span>
      <TextoCatalogo
        titulo={concluido.nome}
        classeDetalhe="text-texto-secundario md:text-sucesso-700"
        detalhe={
          <span className="inline-flex items-center gap-1">
            <Check aria-hidden="true" className="size-3" />
            Completo
            <span className="hidden md:inline">· {formatarData(concluido.concluido_em)}</span>
          </span>
        }
      />
    </button>
  );
}
