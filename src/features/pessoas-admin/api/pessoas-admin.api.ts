import { api } from "@/shared/api/cliente-http";
import type { SituacaoConta, SituacaoFiliacao } from "@/shared/sessao/tipos";

export type FiltrosPessoas = { busca?: string; pagina?: number; tamanho?: number };

export type PessoaResumo = {
  id_pessoa: string;
  nome_completo: string;
  email: string | null;
  situacao_conta: SituacaoConta;
  bol_admin: boolean;
  data_cadastro: string;
  data_ultimo_acesso: string | null;
  filiacao: { situacao: SituacaoFiliacao; pmi_id: string | null } | null;
};

export type RespostaPaginada<T> = {
  itens: T[];
  total: number;
  pagina: number;
  tamanho: number;
};

export function listarPessoas(filtros: FiltrosPessoas): Promise<RespostaPaginada<PessoaResumo>> {
  return api.obter<RespostaPaginada<PessoaResumo>>("/admin/pessoas", { consulta: filtros });
}
