import { api } from "@/shared/api/cliente-http";

export type Preferencias = {
  gamificacao: boolean;
  email_marketing: boolean;
  exibir_vitrine: boolean;
};

export type AtualizarPreferencias = Partial<Preferencias>;

const CAMINHO = "/me/preferencias";

export function obterPreferencias(): Promise<Preferencias> {
  return api.obter<Preferencias>(CAMINHO);
}

export function atualizarPreferencias(alteracao: AtualizarPreferencias): Promise<Preferencias> {
  return api.atualizar<Preferencias>(CAMINHO, alteracao);
}
