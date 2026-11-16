import type { Pagina } from "@/shared/api/tipos";

export const MODALIDADES = ["PRESENCIAL", "REMOTO", "HIBRIDO"] as const;
export type Modalidade = (typeof MODALIDADES)[number];

export const MEIOS_CANDIDATURA = ["LINK", "EMAIL"] as const;
export type MeioCandidatura = (typeof MEIOS_CANDIDATURA)[number];

export const SITUACOES_OPORTUNIDADE = ["RASCUNHO", "PUBLICADA", "ENCERRADA"] as const;
export type SituacaoOportunidade = (typeof SITUACOES_OPORTUNIDADE)[number];

export type ItemOportunidade = {
  id_oportunidade: string;
  titulo: string;
  empresa: string;
  logo_empresa: string | null;
  modalidade: Modalidade | null;
  localidade: string | null;
  data_publicacao: string | null;
  data_encerramento: string | null;
  bloqueado: false;
};

export type ItemPreviaOportunidade = { logo_empresa: string | null; bloqueado: true };
export type PreviaOportunidades = { total: number; itens: ItemPreviaOportunidade[] };
export type ListaOportunidades = Pagina<ItemOportunidade>;
export type RespostaOportunidades = PreviaOportunidades | ListaOportunidades;

export type DetalheOportunidade = Omit<ItemOportunidade, "bloqueado"> & {
  descricao: string;
  meio_candidatura: MeioCandidatura;
};

export type Candidatura =
  | { meio_candidatura: "LINK"; url_candidatura: string }
  | { meio_candidatura: "EMAIL"; email_recrutador: string; assunto: string };

export type OrdenacaoVagas = "recentes" | "alfabetica";

export type FiltrosOportunidades = {
  q?: string;
  modalidade?: Modalidade;
  ordenar?: OrdenacaoVagas;
  page?: number;
};
