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

export function diasAte(dataCivil: string, agora: Date = new Date()): number {
  return emDiasUtc(dataCivil) - emDiasUtc(hojeNoFuso(agora));
}
