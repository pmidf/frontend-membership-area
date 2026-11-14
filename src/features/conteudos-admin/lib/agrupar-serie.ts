import { formatarDataCivil, formatarDiaMes } from "@/shared/lib/datas";

import type { PontoSerie } from "../tipos/conteudo-admin";

export const LIMITE_DIAS_SEM_AGRUPAR = 60;
const DIAS_NA_SEMANA = 7;

export type BarraSerie = { chave: string; rotulo: string; rotuloEixo: string; valor: number };

export function agruparSerie(serie: PontoSerie[]): { porSemana: boolean; barras: BarraSerie[] } {
  if (serie.length <= LIMITE_DIAS_SEM_AGRUPAR) {
    return {
      porSemana: false,
      barras: serie.map(({ dia, visualizacoes }) => ({
        chave: dia,
        rotulo: formatarDataCivil(dia),
        rotuloEixo: formatarDiaMes(dia),
        valor: visualizacoes,
      })),
    };
  }
  const barras: BarraSerie[] = [];
  for (let inicio = 0; inicio < serie.length; inicio += DIAS_NA_SEMANA) {
    const semana = serie.slice(inicio, inicio + DIAS_NA_SEMANA);
    const primeiro = semana[0].dia;
    const ultimo = semana[semana.length - 1].dia;
    barras.push({
      chave: primeiro,
      rotulo: `${formatarDiaMes(primeiro)} a ${formatarDataCivil(ultimo)}`,
      rotuloEixo: formatarDiaMes(primeiro),
      valor: semana.reduce((soma, { visualizacoes }) => soma + visualizacoes, 0),
    });
  }
  return { porSemana: true, barras };
}
