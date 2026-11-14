export const FUSO_HORARIO = "America/Sao_Paulo";

const DIA_EM_MS = 86_400_000;

const formatoDataCivil = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSO_HORARIO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

type DataCivil = { ano: string; mes: string; dia: string };

function lerDataCivil(valor: string): DataCivil {
  const [ano, mes, dia] = valor.slice(0, 10).split("-");
  return { ano, mes, dia };
}

function emDiasUtc(valor: string): number {
  const { ano, mes, dia } = lerDataCivil(valor);
  return Date.UTC(Number(ano), Number(mes) - 1, Number(dia)) / DIA_EM_MS;
}

export function hojeNoFuso(agora: Date = new Date()): string {
  return formatoDataCivil.format(agora);
}

export function formatarMesAno(dataCivil: string): string {
  const { ano, mes } = lerDataCivil(dataCivil);
  return `${mes}/${ano}`;
}

export function formatarDiaMes(dataCivil: string): string {
  const { mes, dia } = lerDataCivil(dataCivil);
  return `${dia}/${mes}`;
}

export function formatarDataCivil(dataCivil: string): string {
  const { ano, mes, dia } = lerDataCivil(dataCivil);
  return `${dia}/${mes}/${ano}`;
}

export function somarDias(dataCivil: string, dias: number): string {
  return new Date((emDiasUtc(dataCivil) + dias) * DIA_EM_MS).toISOString().slice(0, 10);
}

export function diasEntre(inicio: string, fim: string): number {
  return emDiasUtc(fim) - emDiasUtc(inicio);
}

export function diasAte(dataCivil: string, agora: Date = new Date()): number {
  return emDiasUtc(dataCivil) - emDiasUtc(hojeNoFuso(agora));
}

const formatoDataHora = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO_HORARIO,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const formatoData = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO_HORARIO,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const formatoRelativo = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

const unidadesRelativas: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * DIA_EM_MS],
  ["month", 30 * DIA_EM_MS],
  ["day", DIA_EM_MS],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

export function formatarDataHora(instante: string): string {
  return formatoDataHora.format(new Date(instante)).replace(",", " às");
}

export function formatarData(instante: string): string {
  return formatoData.format(new Date(instante));
}

export function diasDesde(instante: string, agora: Date = new Date()): string {
  const dias = -diasAte(hojeNoFuso(new Date(instante)), agora);
  if (dias <= 0) return "Hoje";
  return dias === 1 ? "Ontem" : `há ${dias} dias`;
}

export function formatarDataHoraOuHoje(instante: string, agora: Date = new Date()): string {
  const texto = formatarDataHora(instante);
  const ehHoje = hojeNoFuso(new Date(instante)) === hojeNoFuso(agora);
  return ehHoje ? texto.replace(/^.* às/, "Hoje às") : texto;
}

export function tempoRelativo(instante: string, agora: Date = new Date()): string {
  const diferenca = new Date(instante).getTime() - agora.getTime();
  for (const [unidade, duracao] of unidadesRelativas) {
    if (Math.abs(diferenca) >= duracao) {
      return formatoRelativo.format(Math.round(diferenca / duracao), unidade);
    }
  }
  return "agora mesmo";
}

export function tempoDesde(instante: string, agora: Date = new Date()): string {
  return new Date(instante) > agora ? "agora mesmo" : tempoRelativo(instante, agora);
}
