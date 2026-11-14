import type { SituacaoConta } from "@/shared/sessao/tipos";
import type { Tom } from "@/shared/ui";

import type { PessoaResumo } from "../api/pessoas-admin.api";

export type RotuloComTom = { rotulo: string; tom: Tom };

export function rotuloFiliacao(filiacao: PessoaResumo["filiacao"]): RotuloComTom {
  return filiacao?.situacao === "APROVADO"
    ? { rotulo: "Filiado", tom: "aqua" }
    : { rotulo: "Não-Filiado", tom: "neutro" };
}

export const rotulosSituacaoConta: Record<SituacaoConta, RotuloComTom> = {
  ATIVA: { rotulo: "Ativa", tom: "aqua" },
  SUSPENSA: { rotulo: "Suspensa", tom: "erro" },
};
