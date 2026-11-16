import { hojeNoFuso } from "@/shared/lib/datas";

import { ANO_INICIAL_RELATORIO, type RelatorioResgates } from "../tipos/relatorio-resgates";

const formatoNumero = new Intl.NumberFormat("pt-BR");
const formatoPercentual = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 1,
});

export const formatarNumero = (valor: number) => formatoNumero.format(valor);

export function anoAtual(agora: Date = new Date()): number {
  return Number(hojeNoFuso(agora).slice(0, 4));
}

export function anosDoRelatorio(agora: Date = new Date()): number[] {
  const ultimo = anoAtual(agora);
  return Array.from({ length: ultimo - ANO_INICIAL_RELATORIO + 1 }, (_, indice) => ultimo - indice);
}

const plural = (quantidade: number, singular: string, varios: string) =>
  `${formatarNumero(quantidade)} ${quantidade === 1 ? singular : varios}`;

export function textoTaxaUtilizacao(relatorio: RelatorioResgates): string {
  const resgates = plural(relatorio.total_resgates, "resgate", "resgates");
  const ativos = plural(relatorio.filiados_ativos, "filiado ativo", "filiados ativos");
  const distintos =
    relatorio.filiados_distintos === 1
      ? "1 filiado distinto resgatou"
      : `${formatarNumero(relatorio.filiados_distintos)} filiados distintos resgataram`;
  return (
    `${resgates} de ${ativos} em ${relatorio.ano}. ` +
    `${distintos} ao menos uma vantagem, o equivalente a ${formatoPercentual.format(relatorio.taxa)} da base.`
  );
}
