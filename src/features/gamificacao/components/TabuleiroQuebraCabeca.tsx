import { useId } from "react";

import { cn } from "@/shared/ui";

import {
  ALTURA_TABULEIRO,
  ENCAIXE,
  FORMAS_PECAS,
  LADO_PECA,
  LARGURA_TABULEIRO,
} from "../lib/formas-pecas";
import { posicaoDoIndice, recortesPorIndice } from "../lib/posicoes-tabuleiro";
import { TOTAL_PECAS, type PecaObtida } from "../tipos/gamificacao";

type PropsTabuleiroQuebraCabeca = {
  pecas: PecaObtida[];
  className?: string;
};

const LADO_RECORTE = LADO_PECA + ENCAIXE * 2;

function PecaRevelada({
  indice,
  recorte,
  idBase,
}: {
  indice: number;
  recorte: string;
  idBase: string;
}) {
  const posicao = posicaoDoIndice(indice);
  if (!posicao) return null;
  const idRecorte = `${idBase}-peca-${indice}`;

  return (
    <g data-peca={indice} data-revelada="true">
      <clipPath id={idRecorte}>
        <path d={FORMAS_PECAS[indice]} />
      </clipPath>
      <image
        href={recorte}
        x={posicao.coluna * LADO_PECA - ENCAIXE}
        y={posicao.linha * LADO_PECA - ENCAIXE}
        width={LADO_RECORTE}
        height={LADO_RECORTE}
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${idRecorte})`}
      />
      <path d={FORMAS_PECAS[indice]} fill="none" className="stroke-branco" strokeWidth={1.8} />
    </g>
  );
}

function PecaOculta({ indice }: { indice: number }) {
  return (
    <path
      data-peca={indice}
      data-revelada="false"
      d={FORMAS_PECAS[indice]}
      className="fill-peca-vazia stroke-peca-contorno"
      strokeWidth={1.8}
      strokeDasharray="4.8 3.84"
    />
  );
}

export function TabuleiroQuebraCabeca({ pecas, className }: PropsTabuleiroQuebraCabeca) {
  const idBase = useId().replace(/:/g, "");
  const recortes = recortesPorIndice(pecas);
  const coletadas = recortes.filter(Boolean).length;
  const ordem = recortes
    .map((recorte, indice) => ({ recorte, indice }))
    .sort((a, b) => Number(Boolean(a.recorte)) - Number(Boolean(b.recorte)));

  return (
    <svg
      role="img"
      aria-label={`${coletadas} de ${TOTAL_PECAS} peças coletadas`}
      viewBox={`0 0 ${LARGURA_TABULEIRO} ${ALTURA_TABULEIRO}`}
      className={cn("block aspect-[2/1] h-auto w-full overflow-visible", className)}
    >
      {ordem.map(({ recorte, indice }) =>
        recorte ? (
          <PecaRevelada key={indice} indice={indice} recorte={recorte} idBase={idBase} />
        ) : (
          <PecaOculta key={indice} indice={indice} />
        ),
      )}
    </svg>
  );
}
