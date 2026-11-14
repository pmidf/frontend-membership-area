import { api } from "@/shared/api/cliente-http";
import type { Escolaridade, Genero, Perfil } from "@/shared/sessao/tipos";

export type AtualizarPerfil = Partial<{
  nome_completo: string;
  data_nascimento: string;
  genero: Genero;
  escolaridade: Escolaridade;
  telefone: string;
  empresa: string;
  cargo: string;
  linkedin_url: string | null;
  mini_bio: string | null;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
}>;

export function atualizarPerfil(dados: AtualizarPerfil): Promise<Perfil> {
  return api.atualizar<Perfil>("/me", dados);
}

export function excluirConta(senha: string): Promise<void> {
  return api.remover<void>("/me", { senha });
}
