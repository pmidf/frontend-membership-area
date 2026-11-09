import type { Pagina } from "@/shared/api/tipos";

export const CATEGORIAS_BENEFICIO = [
  "EDUCACAO",
  "FERRAMENTAS",
  "EVENTOS",
  "CERTIFICACAO",
  "CARREIRA",
] as const;

export type CategoriaBeneficio = (typeof CATEGORIAS_BENEFICIO)[number];

export type TipoResgate = "CUPOM" | "INSTRUCAO";

export type ItemPreviaBeneficio = { imagem: string; bloqueado: true };

export type PreviaBeneficios = { total: number; itens: ItemPreviaBeneficio[] };

export type ItemBeneficio = {
  id_beneficio: string;
  titulo: string;
  legenda: string;
  imagem: string;
  parceiro: string;
  categoria: CategoriaBeneficio;
  vigencia_fim: string | null;
  resgatado: boolean;
  bloqueado: false;
};

export type ListaBeneficios = Pagina<ItemBeneficio> & { categorias: CategoriaBeneficio[] };

export type RespostaBeneficios = PreviaBeneficios | ListaBeneficios;

export type DetalheBeneficio = Omit<ItemBeneficio, "bloqueado"> & {
  descricao: string;
  tipo_resgate: TipoResgate;
  vigencia_inicio: string;
};

export type FiltrosBeneficios = {
  q?: string;
  categoria?: CategoriaBeneficio;
  page?: number;
};

type ResgateComum = {
  id_beneficio: string;
  titulo: string;
  data_resgate: string;
  conteudo_entregue: string;
};

export type ResgateCupom = ResgateComum & { tipo_resgate: "CUPOM"; site_url: string | null };

export type ResgateInstrucao = ResgateComum & { tipo_resgate: "INSTRUCAO" };

export type ResgateBeneficio = ResgateCupom | ResgateInstrucao;
