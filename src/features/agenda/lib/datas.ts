// Formatação de datas da agenda. Todas as datas são exibidas no fuso America/Sao_Paulo (RN-05.01.4),
// independentemente do fuso do servidor ou do navegador.

export const FUSO_AGENDA = "America/Sao_Paulo";

const MESES_CURTOS = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

function partes(iso: string) {
  const formatador = new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO_AGENDA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "long",
    hourCycle: "h23",
  });
  const mapa = Object.fromEntries(formatador.formatToParts(new Date(iso)).map((p) => [p.type, p.value]));
  return {
    ano: Number(mapa.year),
    mes: Number(mapa.month),
    dia: Number(mapa.day),
    hora: mapa.hour,
    minuto: mapa.minute,
    diaSemana: mapa.weekday as string,
  };
}

function capitalizar(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** "08h30" */
export function formatarHora(iso: string) {
  const { hora, minuto } = partes(iso);
  return `${hora}h${minuto}`;
}

/** "08h30 às 18h00" */
export function formatarFaixaHorario(inicio: string, fim: string) {
  return `${formatarHora(inicio)} às ${formatarHora(fim)}`;
}

/** "29 de novembro de 2026" */
export function formatarDataLonga(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO_AGENDA, dateStyle: "long" }).format(new Date(iso));
}

/** "Domingo, 29 de novembro de 2026" */
export function formatarDataCompleta(iso: string) {
  return capitalizar(
    new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO_AGENDA, dateStyle: "full" }).format(new Date(iso)),
  );
}

/** "29/11/2026" */
export function formatarDataCurta(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO_AGENDA, dateStyle: "short" }).format(new Date(iso));
}

/** "Quinta" */
export function formatarDiaSemana(iso: string) {
  return capitalizar(partes(iso).diaSemana.replace("-feira", ""));
}

/** { dia: "26", mes: "NOV" } para o selo de data dos itens da lista. */
export function seloData(iso: string) {
  const { dia, mes } = partes(iso);
  return { dia: String(dia).padStart(2, "0"), mes: MESES_CURTOS[mes - 1] };
}

/** Chave "AAAA-MM-DD" do dia do evento no fuso da agenda (para agrupar no calendário). */
export function chaveDia(iso: string) {
  const { ano, mes, dia } = partes(iso);
  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

/** Chave "AAAA-MM" do mês corrente no fuso da agenda. */
export function chaveMesAtual(agora = new Date()) {
  const { ano, mes } = partes(agora.toISOString());
  return `${ano}-${String(mes).padStart(2, "0")}`;
}
