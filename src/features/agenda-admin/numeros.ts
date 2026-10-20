// Números dos eventos para o Admin (US-05.05). Tudo calculado a partir das participações do Sympla (RN-05.05.1).
import { jaAconteceu } from "@/features/agenda/lib/regras";
import type { Evento, ParticipanteEvento } from "@/features/agenda/types";

export type SituacaoEvento = "ativo" | "inativo";

export type NumerosEvento = {
  eventoId: string;
  situacao: SituacaoEvento;
  inscritos: number;
  presentes: number;
  ausentes: number;
  cancelados: number;
  /** presentes ÷ inscritos; `null` sem inscritos. */
  taxa: number | null;
  porTipo: { tipo: string; inscritos: number }[];
  /** O Sympla não respondeu para este evento: os números não são confiáveis. */
  indisponivel?: boolean;
};

export type TotaisAgregados = {
  eventos: number;
  inscritos: number;
  presentes: number;
  ausentes: number;
  cancelados: number;
  taxa: number | null;
};

/** RN-05.05.3: ativo = futuro ou em andamento; inativo = encerrado ou cancelado. */
export function situacaoDo(evento: Evento, agora: Date): SituacaoEvento {
  return evento.cancelado || jaAconteceu(evento, agora) ? "inativo" : "ativo";
}

/**
 * RN-05.05.2: "Inscrito" = ingresso não cancelado; "Presente" = check-in; "Ausente" = inscrito sem check-in
 * em evento encerrado; "Cancelado" = ingresso cancelado no Sympla.
 */
export function calcularNumeros(
  evento: Evento,
  ativos: ParticipanteEvento[],
  cancelados: ParticipanteEvento[],
  agora: Date,
): NumerosEvento {
  const presentes = ativos.filter((p) => p.checkIn).length;
  // Evento cancelado não aconteceu: ninguém fica "ausente" e não há taxa de presença.
  const encerrado = jaAconteceu(evento, agora) && !evento.cancelado;
  const porTipo = new Map<string, number>();
  for (const p of ativos) porTipo.set(p.tipoIngresso, (porTipo.get(p.tipoIngresso) ?? 0) + 1);

  return {
    eventoId: evento.id,
    situacao: situacaoDo(evento, agora),
    inscritos: ativos.length,
    presentes,
    ausentes: encerrado ? ativos.length - presentes : 0,
    cancelados: cancelados.length,
    taxa: !evento.cancelado && ativos.length > 0 ? presentes / ativos.length : null,
    porTipo: [...porTipo].map(([tipo, inscritos]) => ({ tipo, inscritos })).sort((a, b) => b.inscritos - a.inscritos),
  };
}

type Contagens = Pick<NumerosEvento, "inscritos" | "presentes" | "ausentes" | "cancelados">;

/** RN-05.05.4: a taxa agregada é calculada sobre as somas, não pela média das taxas. */
export function agregar(numeros: Contagens[]): TotaisAgregados {
  const soma = (campo: "inscritos" | "presentes" | "ausentes" | "cancelados") =>
    numeros.reduce((total, n) => total + n[campo], 0);
  const inscritos = soma("inscritos");
  const presentes = soma("presentes");
  return {
    eventos: numeros.length,
    inscritos,
    presentes,
    ausentes: soma("ausentes"),
    cancelados: soma("cancelados"),
    taxa: inscritos > 0 ? presentes / inscritos : null,
  };
}

export function formatarTaxa(taxa: number | null) {
  if (taxa === null) return "—";
  return `${(taxa * 100).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

export function formatarNumero(valor: number) {
  return valor.toLocaleString("pt-BR");
}
