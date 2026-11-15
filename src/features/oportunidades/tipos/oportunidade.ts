export const MODALIDADES = ["PRESENCIAL", "REMOTO", "HIBRIDO"] as const;
export type Modalidade = (typeof MODALIDADES)[number];

export const MEIOS_CANDIDATURA = ["LINK", "EMAIL"] as const;
export type MeioCandidatura = (typeof MEIOS_CANDIDATURA)[number];

export const SITUACOES_OPORTUNIDADE = ["RASCUNHO", "PUBLICADA", "ENCERRADA"] as const;
export type SituacaoOportunidade = (typeof SITUACOES_OPORTUNIDADE)[number];

export type DetalheOportunidade = {
  id_oportunidade: string;
  titulo: string;
  empresa: string;
  logo_empresa: string | null;
  modalidade: Modalidade | null;
  localidade: string | null;
  data_publicacao: string | null;
  data_encerramento: string | null;
  descricao: string;
  meio_candidatura: MeioCandidatura;
};
