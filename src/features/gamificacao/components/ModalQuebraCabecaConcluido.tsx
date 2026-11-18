import { formatarDataCivil, hojeNoFuso } from "@/shared/lib/datas";
import { Botao, Modal } from "@/shared/ui";

import type { PecaSorteada } from "../tipos/gamificacao";
import { ImagemQuebraCabeca } from "./ImagemQuebraCabeca";

type Conclusao = Extract<PecaSorteada, { concluido: true }>;

type PropsModalQuebraCabecaConcluido = {
  conclusao: Conclusao | null;
  aoFechar: () => void;
};

export function ModalQuebraCabecaConcluido({
  conclusao,
  aoFechar,
}: PropsModalQuebraCabecaConcluido) {
  if (!conclusao) return null;

  return (
    <Modal
      aberto
      aoFechar={aoFechar}
      titulo={
        <span className="block text-center text-h3">Parabéns! Você completou o quebra-cabeça!</span>
      }
    >
      <div className="flex flex-col gap-4">
        <ImagemQuebraCabeca
          src={conclusao.imagem_original}
          className="aspect-[496/220] w-full rounded-md"
        />
        <div className="flex flex-col gap-1">
          <h3 className="text-h3">{conclusao.nome}</h3>
          <p className="text-corpo-pequeno font-medium text-texto-marca">{conclusao.legenda}</p>
        </div>
        <p className="text-corpo-pequeno whitespace-pre-line text-texto-secundario">
          {conclusao.historia}
        </p>
        <p className="text-legenda text-texto-secundario">
          Concluído em {formatarDataCivil(hojeNoFuso())}
        </p>
        <div className="flex flex-col items-center gap-3 pt-2">
          <Botao onClick={aoFechar} data-foco-inicial className="w-full sm:w-64">
            Fechar
          </Botao>
          <p className="text-legenda text-texto-secundario">
            Ao fechar, você volta para sortear seu próximo quebra-cabeça →
          </p>
        </div>
      </div>
    </Modal>
  );
}
