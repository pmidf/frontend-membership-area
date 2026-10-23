// Leitura dos filtros da agenda a partir da URL, para que filtros e visão sejam compartilháveis.
import type { FiltrosAgenda, FormatoEvento, PeriodoAgenda, VisaoAgenda } from "../types";

type SearchParams = Record<string, string | string[] | undefined>;

const PERIODOS: PeriodoAgenda[] = ["proximos", "30d", "90d", "passados"];
const FORMATOS: FormatoEvento[] = ["online", "presencial"];

function valor(params: SearchParams, chave: string) {
  const v = params[chave];
  return (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
}

export function lerVisao(params: SearchParams): VisaoAgenda {
  return valor(params, "visao") === "calendario" ? "calendario" : "lista";
}

export function lerFiltros(params: SearchParams): FiltrosAgenda {
  const periodo = valor(params, "periodo") as PeriodoAgenda | undefined;
  const formato = valor(params, "formato") as FormatoEvento | undefined;
  return {
    busca: valor(params, "q"),
    categoria: valor(params, "categoria"),
    formato: formato && FORMATOS.includes(formato) ? formato : undefined,
    periodo: periodo && PERIODOS.includes(periodo) ? periodo : "proximos",
  };
}

/** Mês exibido no calendário ("AAAA-MM"); inválido ou ausente → `undefined`. */
export function lerMes(params: SearchParams) {
  const mes = valor(params, "mes");
  return mes && /^\d{4}-(0[1-9]|1[0-2])$/.test(mes) ? mes : undefined;
}

/** Quantos eventos passados exibir ("Ver mais" soma uma página). */
export const PAGINA_PASSADOS = 20;

export function lerLimite(params: SearchParams) {
  const limite = Number(valor(params, "limite"));
  return Number.isInteger(limite) && limite > 0 ? Math.min(limite, 500) : PAGINA_PASSADOS;
}

export function haFiltrosAtivos(filtros: FiltrosAgenda) {
  return Boolean(filtros.busca || filtros.categoria || filtros.formato || filtros.periodo !== "proximos");
}
