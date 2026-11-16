import { api } from "@/shared/api/cliente-http";

import type {
  FiltrosProfissionais,
  ListaProfissionais,
  PerfilProfissional,
} from "../tipos/profissional";

const CAMINHO = "/profissionais";

export function listarProfissionais(
  filtros: FiltrosProfissionais = {},
): Promise<ListaProfissionais> {
  return api.obter<ListaProfissionais>(CAMINHO, { consulta: filtros });
}

export function detalharProfissional(id: string): Promise<PerfilProfissional> {
  return api.obter<PerfilProfissional>(`${CAMINHO}/${encodeURIComponent(id)}`);
}
