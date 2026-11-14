import type { CategoriaBeneficio, TipoResgate } from "@/features/beneficios/tipos/beneficio";
import { SITUACOES_PUBLICACAO, type SituacaoPublicacao } from "@/shared/publicacao/situacao";

export const SITUACOES_BENEFICIO = SITUACOES_PUBLICACAO;
export type SituacaoBeneficio = SituacaoPublicacao;

export const TIPOS_RESGATE = ["CUPOM", "INSTRUCAO"] as const;

export const VIGENCIAS_BENEFICIO = ["VIGENTE", "FUTURA", "ENCERRADA"] as const;
export type VigenciaBeneficio = (typeof VIGENCIAS_BENEFICIO)[number];

export const ORDENACOES_BENEFICIO = ["resgates_desc", "resgates_asc"] as const;
export type OrdenacaoBeneficio = (typeof ORDENACOES_BENEFICIO)[number];

export type ItemBeneficioAdmin = {
  id_beneficio: string;
  titulo: string;
  parceiro: string;
  categoria: CategoriaBeneficio;
  tipo_resgate: TipoResgate;
  vigencia_inicio: string;
  vigencia_fim: string | null;
  situacao: SituacaoBeneficio;
  quantidade_resgates: number;
};

export type FiltrosBeneficiosAdmin = {
  q?: string;
  situacao?: SituacaoBeneficio;
  tipo_resgate?: TipoResgate;
  categoria?: CategoriaBeneficio;
  vigencia?: VigenciaBeneficio;
};

export type ConsultaBeneficiosAdmin = FiltrosBeneficiosAdmin & {
  ordenar?: OrdenacaoBeneficio;
  page?: number;
};
