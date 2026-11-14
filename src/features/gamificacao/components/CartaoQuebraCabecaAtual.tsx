"use client";

import { useState } from "react";

import { Cartao } from "@/shared/ui";

import { useAplicarPecaSorteada } from "../api/gamificacao.queries";
import { TOTAL_PECAS, type PecaSorteada, type QuebraCabecaEmAndamento } from "../tipos/gamificacao";
import { AreaSorteioPeca } from "./AreaSorteioPeca";
import { AreaSorteioQuebraCabeca } from "./AreaSorteioQuebraCabeca";
import { ModalNovoQuebraCabeca } from "./ModalNovoQuebraCabeca";
import { ModalPecaRevelada } from "./ModalPecaRevelada";
import { ModalQuebraCabecaConcluido } from "./ModalQuebraCabecaConcluido";
import { TabuleiroQuebraCabeca } from "./TabuleiroQuebraCabeca";

type PropsCartaoQuebraCabecaAtual = {
  emAndamento: QuebraCabecaEmAndamento | null;
  creditos: number;
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

export function CartaoQuebraCabecaAtual({ emAndamento, creditos }: PropsCartaoQuebraCabecaAtual) {
  const [parabens, setParabens] = useState(false);
  const [revelada, setRevelada] = useState<PecaSorteada | null>(null);
  const [pecaNova, setPecaNova] = useState<number | null>(null);
  const aplicarPeca = useAplicarPecaSorteada();

  function fecharRevelacao() {
    if (!revelada) return;
    aplicarPeca(revelada);
    setPecaNova(revelada.concluido ? null : revelada.indice);
    setRevelada(null);
  }

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
            <TabuleiroQuebraCabeca
              pecas={emAndamento.pecas}
              pecaNova={pecaNova}
              className="max-w-108"
            />
            <p className="text-corpo font-bold md:text-h3">Quebra-cabeça em andamento</p>
            <p className="text-corpo-pequeno font-medium text-texto-marca md:text-corpo">
              {emAndamento.pecas_obtidas} de {TOTAL_PECAS} peças coletadas
            </p>
            <BarraProgresso coletadas={emAndamento.pecas_obtidas} />
            <AreaSorteioPeca
              pecasObtidas={emAndamento.pecas_obtidas}
              creditos={creditos}
              aoRevelar={setRevelada}
            />
          </>
        ) : (
          <AreaSorteioQuebraCabeca aoSortear={() => setParabens(true)} />
        )}
      </Cartao>
      <ModalNovoQuebraCabeca aberto={parabens} aoFechar={() => setParabens(false)} />
      <ModalPecaRevelada
        pecasObtidas={revelada && !revelada.concluido ? revelada.pecas_obtidas : null}
        aoFechar={fecharRevelacao}
      />
      <ModalQuebraCabecaConcluido
        conclusao={revelada?.concluido ? revelada : null}
        aoFechar={fecharRevelacao}
      />
    </section>
  );
}
