// Modelo do evento como a plataforma o expõe ao frontend.
// Origem: sincronização com GET /v1.6.0/events da API pública do Sympla (US-05.03).

export type FormatoEvento = "online" | "presencial";

export type EnderecoEvento = {
  nome: string; // ex.: "Impact Hub Brasília"
  logradouro: string; // ex.: "SGAN 601 Módulo N"
  bairro?: string;
  cidade: string;
  uf: string;
};

export type Evento = {
  id: string;
  titulo: string;
  /** Texto do campo `detail` do Sympla. */
  descricao: string;
  /** ISO 8601 com offset. Exibido sempre em America/Sao_Paulo (RN-05.01.4). */
  inicio: string;
  fim: string;
  imagemUrl?: string;
  /** Página do evento no Sympla, onde a inscrição acontece (RN-05.01.2). */
  urlSympla: string;
  /** Sem endereço → online; com endereço → presencial (formato inferido, não editável). */
  endereco: EnderecoEvento | null;
  categoria: string;
  cancelado: boolean;
};

/** Situação da pessoa autenticada no evento (US-05.02). */
export type StatusParticipacao = "inscrito" | "presente" | "ausente";

export type EventoComParticipacao = Evento & {
  participacao: StatusParticipacao | null;
};

export type VisaoAgenda = "lista" | "calendario";

export type PeriodoAgenda = "proximos" | "30d" | "90d" | "passados";

export type FiltrosAgenda = {
  busca?: string;
  formato?: FormatoEvento;
  categoria?: string;
  periodo: PeriodoAgenda;
};
