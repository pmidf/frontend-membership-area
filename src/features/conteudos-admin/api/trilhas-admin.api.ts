import { api } from "@/shared/api/cliente-http";
import type { Pagina } from "@/shared/api/tipos";

import type {
  AtualizarTrilha,
  ConsultaTrilhasAdmin,
  CriarTrilha,
  ResumoTrilhaAdmin,
  TrilhaAdmin,
} from "../tipos/trilha-admin";

const CAMINHO = "/admin/trilhas";
const caminhoTrilha = (id: string) => `${CAMINHO}/${encodeURIComponent(id)}`;

export function listarTrilhasAdmin(
  consulta: ConsultaTrilhasAdmin = {},
): Promise<Pagina<ResumoTrilhaAdmin>> {
  return api.obter<Pagina<ResumoTrilhaAdmin>>(CAMINHO, { consulta });
}

export function detalharTrilhaAdmin(id: string): Promise<TrilhaAdmin> {
  return api.obter<TrilhaAdmin>(caminhoTrilha(id));
}

export function criarTrilha(dados: CriarTrilha): Promise<TrilhaAdmin> {
  return api.enviar<TrilhaAdmin>(CAMINHO, dados);
}

export function atualizarTrilha(id: string, dados: AtualizarTrilha): Promise<TrilhaAdmin> {
  return api.atualizar<TrilhaAdmin>(caminhoTrilha(id), dados);
}

export function publicarTrilha(id: string): Promise<TrilhaAdmin> {
  return api.enviar<TrilhaAdmin>(`${caminhoTrilha(id)}/publicar`);
}

export function despublicarTrilha(id: string): Promise<TrilhaAdmin> {
  return api.enviar<TrilhaAdmin>(`${caminhoTrilha(id)}/despublicar`);
}

export function arquivarTrilha(id: string): Promise<void> {
  return api.remover<void>(caminhoTrilha(id));
}
