import { api } from "@/shared/api/cliente-http";

import type { Perfil } from "./tipos";

export function buscarPerfil(): Promise<Perfil> {
  return api.obter<Perfil>("/me");
}

export function encerrarSessaoNoServidor(): Promise<void> {
  return api.enviar<void>("/auth/logout");
}

export const chavesSessao = {
  perfil: ["sessao", "perfil"] as const,
};
