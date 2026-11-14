import { Cartao } from "@/shared/ui";

import { TOTAL_PECAS, type QuebraCabecaEmAndamento } from "../tipos/gamificacao";
import { TabuleiroQuebraCabeca } from "./TabuleiroQuebraCabeca";
import { TabuleiroVazio } from "./TabuleiroVazio";

type PropsCartaoQuebraCabecaAtual = {
  emAndamento: QuebraCabecaEmAndamento | null;
};

function BarraProgresso({ coletadas }: { coletadas: number }) {
  return (
    <div
      aria-hidden="true"
      className="h-2 w-full max-w-90 overflow-hidden rounded-pill bg-neutro-200"
    >
      <div
        className="h-full rounded-pill bg-acao-primaria"
        style={{ width: `${(coletadas / TOTAL_PECAS) * 100}%` }}
      />
    </div>
  );
}

export function CartaoQuebraCabecaAtual({ emAndamento }: PropsCartaoQuebraCabecaAtual) {
  return (
    <section aria-labelledby="titulo-quebra-cabeca-atual" className="flex flex-col gap-7">
      <header className="sr-only flex-col gap-1 md:not-sr-only md:flex">
        <h2 id="titulo-quebra-cabeca-atual" className="text-h3">
          Quebra-cabeça atual
        </h2>
        <p className="text-corpo-pequeno text-texto-secundario">
          A imagem final fica em segredo até você montar a última peça.
        </p>
      </header>
      <Cartao className="flex flex-col items-center gap-3 p-5 text-center md:gap-5 md:px-6 md:py-10">
        {emAndamento ? (
          <>
            <TabuleiroQuebraCabeca pecas={emAndamento.pecas} className="max-w-108" />
            <p className="text-corpo font-bold md:text-h3">Quebra-cabeça em andamento</p>
            <p className="text-corpo-pequeno font-medium text-texto-marca md:text-corpo">
              {emAndamento.pecas_obtidas} de {TOTAL_PECAS} peças coletadas
            </p>
            <BarraProgresso coletadas={emAndamento.pecas_obtidas} />
          </>
        ) : (
          <>
            <TabuleiroVazio className="max-w-108" />
            <p className="text-corpo font-bold md:text-h3">Nenhum quebra-cabeça em andamento</p>
          </>
        )}
      </Cartao>
    </section>
  );
}
