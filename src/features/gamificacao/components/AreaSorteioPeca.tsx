"use client";

import { ehErroApi } from "@/shared/api/erro-api";
import { useConsultaMidia } from "@/shared/hooks/useConsultaMidia";
import { Botao, useAvisos } from "@/shared/ui";

import { useSortearPeca } from "../api/gamificacao.queries";
import { TOTAL_PECAS, type PecaSorteada } from "../tipos/gamificacao";
import { MOVIMENTO_REDUZIDO } from "./Dado";
import { SemCreditos } from "./SemCreditos";

export const MENSAGEM_FALHA_PECA = "Não foi possível sortear a peça agora. Tente de novo.";

type PropsAreaSorteioPeca = {
  pecasObtidas: number;
  creditos: number;
  aoRevelar: (peca: PecaSorteada) => void;
};

export function AreaSorteioPeca({ pecasObtidas, creditos, aoRevelar }: PropsAreaSorteioPeca) {
  const sortear = useSortearPeca();
  const avisos = useAvisos();
  const movimentoReduzido = useConsultaMidia(MOVIMENTO_REDUZIDO);
  const faltam = TOTAL_PECAS - pecasObtidas;
  const animando = sortear.isPending && !movimentoReduzido;

  function aoClicar() {
    if (sortear.isPending) return;
    sortear.mutate(undefined, {
      onSuccess: aoRevelar,
      onError: (erro) => {
        if (!ehErroApi(erro) || (erro.status !== 403 && erro.status !== 409))
          avisos.erro(MENSAGEM_FALHA_PECA);
      },
    });
  }

  if (creditos <= 0) return <SemCreditos faltam={faltam} />;

  return (
    <div className="flex w-full flex-col items-center gap-3 md:gap-5">
      <p className="max-w-130 text-corpo-pequeno text-texto-secundario">
        Faltam {faltam} {faltam === 1 ? "peça" : "peças"}.{" "}
        <span className="hidden md:inline">
          Você tem créditos disponíveis — use o dado abaixo para sortear a próxima peça.
        </span>
        <span className="md:hidden">Use o dado para sortear a próxima.</span>
      </p>
      <Botao
        onClick={aoClicar}
        aria-busy={sortear.isPending || undefined}
        aria-disabled={sortear.isPending || undefined}
        data-animando={animando}
        className="w-full max-w-90"
      >
        Sortear nova peça
      </Botao>
    </div>
  );
}
