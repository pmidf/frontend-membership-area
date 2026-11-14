import { api } from "@/shared/api/cliente-http";

export type ValidacaoToken = { valido: boolean };
export type RedefinirSenha = { token: string; nova_senha: string };

export function solicitarRecuperacao(email: string): Promise<void> {
  return api.enviar<void>("/auth/senha/esqueci", { email });
}

export function validarTokenSenha(token: string): Promise<ValidacaoToken> {
  return api.obter<ValidacaoToken>("/auth/senha/redefinir/validar", { consulta: { token } });
}

export function redefinirSenha(dados: RedefinirSenha): Promise<void> {
  return api.enviar<void>("/auth/senha/redefinir", dados);
}
