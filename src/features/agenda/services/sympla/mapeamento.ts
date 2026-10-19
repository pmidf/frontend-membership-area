// Conversão dos dados do Sympla para o modelo da plataforma.
import type { EnderecoEvento, Evento } from "../../types";
import type { SymplaEndereco, SymplaEvento } from "./tipos";

/**
 * O Sympla devolve data/hora local na timezone pedida (America/Sao_Paulo), às vezes sem offset.
 * Sem offset, assumimos -03:00: o Brasil não tem horário de verão desde 2019.
 */
export function paraIso(data: string) {
  const normalizada = data.trim().replace(" ", "T");
  return /(Z|[+-]\d{2}:?\d{2})$/.test(normalizada) ? normalizada : `${normalizada}-03:00`;
}

const ENTIDADES: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
};

/**
 * O `detail` do Sympla é HTML escrito pelo organizador. Em vez de injetar HTML de terceiros na página,
 * convertemos para texto puro, preservando quebras de parágrafo.
 */
export function htmlParaTexto(html: string) {
  return html
    .replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*\/\s*(p|div|li|h[1-6])\s*>/gi, "\n")
    .replace(/<\s*li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "")
    .replace(/&(nbsp|amp|lt|gt|quot|apos|#39);/g, (entidade) => ENTIDADES[entidade] ?? entidade)
    .replace(/&#(\d+);/g, (_, codigo) => String.fromCodePoint(Number(codigo)))
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function texto(valor?: string) {
  return valor?.trim() || undefined;
}

/** Sem endereço → online; com endereço → presencial (o Sympla não informa o formato). */
function paraEndereco(endereco?: SymplaEndereco | null): EnderecoEvento | null {
  if (!endereco || !(texto(endereco.address) || texto(endereco.name))) return null;
  const logradouro = [texto(endereco.address), texto(endereco.address_num), texto(endereco.address_alt)]
    .filter(Boolean)
    .join(", ");
  return {
    nome: texto(endereco.name) ?? logradouro,
    logradouro,
    bairro: texto(endereco.neighborhood),
    cidade: texto(endereco.city) ?? "",
    uf: texto(endereco.state) ?? "",
  };
}

export function paraEvento(evento: SymplaEvento): Evento {
  return {
    id: String(evento.id),
    titulo: evento.name.trim(),
    descricao: evento.detail ? htmlParaTexto(evento.detail) : "",
    inicio: paraIso(evento.start_date),
    fim: paraIso(evento.end_date),
    imagemUrl: texto(evento.image),
    urlSympla: evento.url,
    endereco: paraEndereco(evento.address),
    categoria: texto(evento.category_prim?.name) ?? "Outros",
    cancelado: evento.cancelled === 1,
  };
}
