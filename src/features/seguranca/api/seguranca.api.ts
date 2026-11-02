import { api } from "@/shared/api/cliente-http";

export type SessaoAtiva = {
  id_sessao: string;
  ip: string | null;
  user_agent: string | null;
  data_criacao: string;
  data_ultimo_uso: string;
  atual: boolean;
};

export type TrocarSenha = { senha_atual: string; nova_senha: string };

export function listarSessoes(): Promise<SessaoAtiva[]> {
  return api.obter<SessaoAtiva[]>("/me/sessoes");
}

export function encerrarSessao(idSessao: string): Promise<void> {
  return api.remover<void>(`/me/sessoes/${encodeURIComponent(idSessao)}`);
}

export function encerrarOutrasSessoes(): Promise<void> {
  return api.remover<void>("/me/sessoes", undefined, { consulta: { outras: "true" } });
}

export function trocarSenha(dados: TrocarSenha): Promise<void> {
  return api.substituir<void>("/me/senha", dados);
}
