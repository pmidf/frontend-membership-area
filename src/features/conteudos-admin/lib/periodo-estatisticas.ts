import { diasEntre, hojeNoFuso, somarDias } from "@/shared/lib/datas";

import type { PeriodoEstatisticas } from "../tipos/conteudo-admin";

export const DIAS_PADRAO = 30;
export const MAXIMO_DIAS = 366;
const DIA = /^\d{4}-\d{2}-\d{2}$/;

export type PeriodoTela = { de: string; ate: string };

function periodoPadrao(agora: Date): PeriodoTela {
  const ate = hojeNoFuso(agora);
  return { de: somarDias(ate, -(DIAS_PADRAO - 1)), ate };
}

export function periodoDaUrl(
  parametros: Pick<URLSearchParams, "get">,
  agora: Date = new Date(),
): { periodo: PeriodoTela; consulta: PeriodoEstatisticas } {
  const de = parametros.get("de") ?? "";
  const ate = parametros.get("ate") ?? "";
  if (!de && !ate) return { periodo: periodoPadrao(agora), consulta: {} };
  const periodo = { de, ate };
  return erroDoPeriodo(periodo)
    ? { periodo: periodoPadrao(agora), consulta: {} }
    : { periodo, consulta: periodo };
}

export function erroDoPeriodo({ de, ate }: PeriodoTela): string | undefined {
  if (!DIA.test(de) || !DIA.test(ate)) return "Informe as duas datas";
  if (de > ate) return "A data inicial deve ser anterior ou igual à final";
  if (diasEntre(de, ate) + 1 > MAXIMO_DIAS)
    return `O período pode ter no máximo ${MAXIMO_DIAS} dias`;
  return undefined;
}
