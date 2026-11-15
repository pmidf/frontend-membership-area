import type { DetalheOportunidade } from "@/features/oportunidades/tipos/oportunidade";
import { api } from "@/shared/api/cliente-http";

import type {
  AtualizarOportunidade,
  CriarOportunidade,
  OportunidadeAdmin,
} from "../tipos/oportunidade-admin";

const CAMINHO = "/admin/oportunidades";
const caminhoOportunidade = (id: string) => `${CAMINHO}/${encodeURIComponent(id)}`;

export function criarOportunidade(dados: CriarOportunidade): Promise<OportunidadeAdmin> {
  return api.enviar<OportunidadeAdmin>(CAMINHO, dados);
}

export function detalharOportunidadeAdmin(id: string): Promise<OportunidadeAdmin> {
  return api.obter<OportunidadeAdmin>(caminhoOportunidade(id));
}

export function atualizarOportunidade(
  id: string,
  dados: AtualizarOportunidade,
): Promise<OportunidadeAdmin> {
  return api.atualizar<OportunidadeAdmin>(caminhoOportunidade(id), dados);
}

export function previewOportunidade(id: string): Promise<DetalheOportunidade> {
  return api.obter<DetalheOportunidade>(`${caminhoOportunidade(id)}/preview`);
}

export function publicarOportunidade(id: string): Promise<OportunidadeAdmin> {
  return api.enviar<OportunidadeAdmin>(`${caminhoOportunidade(id)}/publicar`);
}
