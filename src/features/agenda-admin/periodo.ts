/**
 * Janela de eventos do console. "recentes" (padrão) limita as consultas de participantes ao que importa
 * no dia a dia; "12m" cobre os últimos 12 meses (RN-05.03.2), com mais chamadas ao Sympla.
 */
export type PeriodoAdmin = "recentes" | "12m";

export const DIAS_RECENTES = 90;

export function lerPeriodoAdmin(valor: string | string[] | undefined): PeriodoAdmin {
  return valor === "12m" ? "12m" : "recentes";
}
