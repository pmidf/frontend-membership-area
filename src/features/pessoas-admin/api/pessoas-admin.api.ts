import type { SessaoAtiva } from "@/features/seguranca/api/seguranca.api";
import { api } from "@/shared/api/cliente-http";
import type { Perfil, SituacaoConta, SituacaoFiliacao } from "@/shared/sessao/tipos";

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

export type SessaoPessoa = Omit<SessaoAtiva, "atual">;

export type PessoaDetalheAdmin = Perfil & {
  exibida_na_vitrine: boolean;
  vitrine_oculta: boolean;
  data_vitrine_oculta: string | null;
  motivo_vitrine_oculta: string | null;
  sessoes_ativas: SessaoPessoa[];
};

const caminhoPessoa = (id: string) => `/admin/pessoas/${encodeURIComponent(id)}`;

export function detalharPessoa(id: string): Promise<PessoaDetalheAdmin> {
  return api.obter<PessoaDetalheAdmin>(caminhoPessoa(id));
}

export function suspenderPessoa(id: string, motivo: string): Promise<void> {
  return api.enviar<void>(`${caminhoPessoa(id)}/suspender`, { motivo });
}

export function reativarPessoa(id: string): Promise<void> {
  return api.enviar<void>(`${caminhoPessoa(id)}/reativar`);
}
