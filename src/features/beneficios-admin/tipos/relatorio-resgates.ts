export type ResgatesPorBeneficio = {
  id_beneficio: string;
  titulo: string;
  parceiro: string;
  resgates: number;
  filiados_distintos: number;
};

export type RelatorioResgates = {
  ano: number;
  total_resgates: number;
  filiados_ativos: number;
  filiados_distintos: number;
  taxa: number;
  por_beneficio: ResgatesPorBeneficio[];
};

export const ANO_INICIAL_RELATORIO = 2020;
