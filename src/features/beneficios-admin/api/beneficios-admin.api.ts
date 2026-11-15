import { baixarArquivo } from "@/shared/api/baixar-arquivo";
import { api } from "@/shared/api/cliente-http";
import type { CategoriaBeneficio, TipoResgate } from "@/features/beneficios/tipos/beneficio";
import type { Pagina } from "@/shared/api/tipos";
import { hojeNoFuso } from "@/shared/lib/datas";

import type {
  ConsultaBeneficiosAdmin,
  FiltrosBeneficiosAdmin,
  ItemBeneficioAdmin,
  SituacaoBeneficio,
} from "../tipos/beneficio-admin";
import type { RelatorioResgates } from "../tipos/relatorio-resgates";

export function listarBeneficiosAdmin(
  consulta: ConsultaBeneficiosAdmin = {},
): Promise<Pagina<ItemBeneficioAdmin>> {
  return api.obter<Pagina<ItemBeneficioAdmin>>("/admin/beneficios", { consulta });
}

export function exportarBeneficios(filtros: FiltrosBeneficiosAdmin): Promise<string> {
  return baixarArquivo("/admin/beneficios/export.csv", `beneficios-${hojeNoFuso()}.csv`, filtros);
}

export function obterRelatorioResgates(ano: number): Promise<RelatorioResgates> {
  return api.obter<RelatorioResgates>("/admin/beneficios/relatorio", { consulta: { ano } });
}

export function exportarRelatorioResgates(ano: number): Promise<string> {
  return baixarArquivo("/admin/beneficios/relatorio.csv", `relatorio-resgates-${ano}.csv`, { ano });
}

export type BeneficioAdmin = {
  id_beneficio: string;
  titulo: string;
  legenda: string;
  descricao: string;
  imagem: string;
  cod_parceiro: string;
  parceiro: string;
  categoria: CategoriaBeneficio;
  tipo_resgate: TipoResgate;
  cod_cupom: string | null;
  desc_instrucao: string | null;
  situacao: SituacaoBeneficio;
  vigencia_inicio: string;
  vigencia_fim: string | null;
  data_publicacao: string | null;
  quantidade_resgates: number;
};

export type AtualizarBeneficio = Partial<
  Pick<
    BeneficioAdmin,
    | "titulo"
    | "legenda"
    | "descricao"
    | "imagem"
    | "categoria"
    | "tipo_resgate"
    | "cod_cupom"
    | "desc_instrucao"
    | "vigencia_inicio"
    | "vigencia_fim"
  >
>;

export type CriarBeneficio = Required<AtualizarBeneficio> & Pick<BeneficioAdmin, "cod_parceiro">;

export type Parceiro = {
  cod_parceiro: string;
  nome: string;
  descricao: string | null;
  site_url: string | null;
};

export type CriarParceiro = {
  nome: string;
  descricao?: string;
  site_url?: string;
};

const caminhoBeneficio = (id: string) => `/admin/beneficios/${encodeURIComponent(id)}`;

export function criarBeneficio(dados: CriarBeneficio): Promise<BeneficioAdmin> {
  return api.enviar<BeneficioAdmin>("/admin/beneficios", dados);
}

export function listarParceiros(): Promise<Parceiro[]> {
  return api.obter<Parceiro[]>("/admin/parceiros");
}

export function criarParceiro(dados: CriarParceiro): Promise<Parceiro> {
  return api.enviar<Parceiro>("/admin/parceiros", dados);
}

export function detalharBeneficioAdmin(id: string): Promise<BeneficioAdmin> {
  return api.obter<BeneficioAdmin>(caminhoBeneficio(id));
}

export function atualizarBeneficio(id: string, dados: AtualizarBeneficio): Promise<BeneficioAdmin> {
  return api.atualizar<BeneficioAdmin>(caminhoBeneficio(id), dados);
}

export type AcaoDeSituacao = "publicar" | "despublicar" | "arquivar";

export function mudarSituacaoBeneficio(id: string, acao: AcaoDeSituacao): Promise<BeneficioAdmin> {
  return api.enviar<BeneficioAdmin>(`${caminhoBeneficio(id)}/${acao}`);
}

export function duplicarBeneficio(id: string): Promise<BeneficioAdmin> {
  return api.enviar<BeneficioAdmin>(`${caminhoBeneficio(id)}/duplicar`);
}
