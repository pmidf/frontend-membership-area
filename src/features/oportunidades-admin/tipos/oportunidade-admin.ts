import type {
  MeioCandidatura,
  Modalidade,
  SituacaoOportunidade,
} from "@/features/oportunidades/tipos/oportunidade";

export type OportunidadeAdmin = {
  id_oportunidade: string;
  id_pessoa: string;
  situacao: SituacaoOportunidade;
  titulo: string;
  empresa: string;
  descricao: string;
  meio_candidatura: MeioCandidatura;
  url_candidatura: string | null;
  email_recrutador: string | null;
  modalidade: Modalidade | null;
  localidade: string | null;
  logo_empresa: string | null;
  data_publicacao: string | null;
  data_encerramento: string | null;
  data_encerrada: string | null;
  motivo_encerramento: string | null;
  id_oportunidade_origem: string | null;
  data_criacao: string;
  data_atualizacao: string;
};

export type CriarOportunidade = {
  titulo: string;
  empresa: string;
  descricao: string;
  url_candidatura: string | null;
  email_recrutador: string | null;
  modalidade: Modalidade | null;
  localidade: string | null;
  logo_empresa: string | null;
  data_encerramento: string | null;
};

export type AtualizarOportunidade = Partial<CriarOportunidade>;

export type ItemOportunidadeAdmin = Pick<
  OportunidadeAdmin,
  | "id_oportunidade"
  | "titulo"
  | "empresa"
  | "modalidade"
  | "data_publicacao"
  | "data_encerramento"
  | "situacao"
>;

export type ConsultaOportunidadesAdmin = {
  situacao?: SituacaoOportunidade;
  q?: string;
  page?: number;
};
