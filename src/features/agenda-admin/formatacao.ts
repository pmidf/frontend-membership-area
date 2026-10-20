import { FUSO_AGENDA } from "@/features/agenda/lib/datas";

/** "31/08 às 12:00" ou, com ano, "31/08/2026 12:00" — sempre no fuso da agenda. */
export function formatarDataHora(iso: string, comAno = false) {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("pt-BR", {
      timeZone: FUSO_AGENDA,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(iso))
      .map((p) => [p.type, p.value]),
  );
  return comAno
    ? `${partes.day}/${partes.month}/${partes.year} ${partes.hour}:${partes.minute}`
    : `${partes.day}/${partes.month} às ${partes.hour}:${partes.minute}`;
}

/** "29/11 08h42" para o horário de check-in. */
export function formatarCheckIn(iso: string) {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("pt-BR", {
      timeZone: FUSO_AGENDA,
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(iso))
      .map((p) => [p.type, p.value]),
  );
  return `${partes.day}/${partes.month} ${partes.hour}h${partes.minute}`;
}
