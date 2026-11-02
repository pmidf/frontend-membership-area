import { api } from "@/shared/api/cliente-http";
import type { SessaoEmitida } from "@/shared/api/token-sessao";

export type DadosLogin = { email: string; senha: string };

export function entrar(dados: DadosLogin): Promise<SessaoEmitida> {
  return api.enviar<SessaoEmitida>("/auth/login", dados);
}
