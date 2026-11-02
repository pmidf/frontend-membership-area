import { api } from "@/shared/api/cliente-http";
import type { SessaoEmitida } from "@/shared/api/token-sessao";
import type { Escolaridade, Genero, SituacaoFiliacao } from "@/shared/sessao/tipos";

export type DadosLogin = { email: string; senha: string };

export type PreCadastro = { email: string; pmi_id?: string };
export type RespostaPreCadastro = { filiado: boolean; dados?: { nome_completo: string } };

export type Cadastro = {
  nome_completo: string;
  email: string;
  senha: string;
  pmi_id?: string;
  aceite_termos: true;
  telefone: string;
  data_nascimento: string;
  genero: Genero;
  escolaridade: Escolaridade;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  empresa: string;
  cargo: string;
  linkedin_url?: string;
};

export type RespostaCadastro = { mensagem: string };

export type ResultadoVinculacao =
  | "APROVADO"
  | "NAO_LOCALIZADO"
  | "OUTRO_CAPITULO"
  | "FILIACAO_INATIVA"
  | "DADOS_NAO_CONFEREM"
  | "PMI_INDISPONIVEL";

export type ConfirmarEmail = { email: string; codigo: string };

export type RespostaConfirmacao = SessaoEmitida & {
  filiacao: { situacao: SituacaoFiliacao; resultado: ResultadoVinculacao | null };
};

export function entrar(dados: DadosLogin): Promise<SessaoEmitida> {
  return api.enviar<SessaoEmitida>("/auth/login", dados);
}

export function preConsultar(dados: PreCadastro): Promise<RespostaPreCadastro> {
  return api.enviar<RespostaPreCadastro>("/auth/pre-cadastro", dados);
}

export function cadastrar(dados: Cadastro): Promise<RespostaCadastro> {
  return api.enviar<RespostaCadastro>("/auth/cadastro", dados);
}

export function confirmarEmail(dados: ConfirmarEmail): Promise<RespostaConfirmacao> {
  return api.enviar<RespostaConfirmacao>("/auth/confirmar-email", dados);
}

export function reenviarCodigo(email: string): Promise<void> {
  return api.enviar<void>("/auth/confirmar-email/reenviar", { email });
}
