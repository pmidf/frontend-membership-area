// Geração do arquivo .ics de "Adicionar ao meu calendário" (US-05.01 c6): título, datas, local e link.
import type { Evento } from "../types";

function dataUtc(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Escapa texto conforme RFC 5545 (seção 3.3.11). */
function escapar(texto: string) {
  return texto.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Quebra linhas com mais de 75 octetos (RFC 5545, seção 3.1). */
function dobrar(linha: string) {
  const partes: string[] = [];
  let resto = linha;
  while (Buffer.byteLength(resto, "utf8") > 75) {
    let corte = 75;
    while (Buffer.byteLength(resto.slice(0, corte), "utf8") > 75) corte--;
    partes.push(resto.slice(0, corte));
    resto = " " + resto.slice(corte);
  }
  partes.push(resto);
  return partes.join("\r\n");
}

export function localDoEvento(evento: Evento) {
  if (!evento.endereco) return "Online";
  const { nome, logradouro, bairro, cidade, uf } = evento.endereco;
  return [nome, logradouro, bairro, `${cidade}/${uf}`].filter(Boolean).join(", ");
}

export function gerarIcs(evento: Evento, agora = new Date()) {
  const linhas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PMI-DF//Area de Membros//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:evento-${evento.id}@membros.pmidf.org`,
    `DTSTAMP:${dataUtc(agora.toISOString())}`,
    `DTSTART:${dataUtc(evento.inicio)}`,
    `DTEND:${dataUtc(evento.fim)}`,
    `SUMMARY:${escapar(evento.titulo)}`,
    `DESCRIPTION:${escapar(`${evento.descricao}\n\nInscrição: ${evento.urlSympla}`)}`,
    `LOCATION:${escapar(localDoEvento(evento))}`,
    `URL:${evento.urlSympla}`,
    evento.cancelado ? "STATUS:CANCELLED" : "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return linhas.map(dobrar).join("\r\n") + "\r\n";
}
