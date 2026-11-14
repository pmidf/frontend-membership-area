import { api } from "@/shared/api/cliente-http";

import type {
  CriarQuebraCabeca,
  EditarQuebraCabeca,
  QuebraCabecaAdmin,
  ItemQuebraCabecaAdmin,
  QuebraCabecaCriado,
} from "../tipos/quebra-cabeca-admin";

const BASE = "/admin/quebra-cabecas";

export function listarQuebraCabecas(): Promise<ItemQuebraCabecaAdmin[]> {
  return api.obter<ItemQuebraCabecaAdmin[]>(BASE);
}

export function criarQuebraCabeca(dados: CriarQuebraCabeca): Promise<QuebraCabecaCriado> {
  return api.enviar<QuebraCabecaCriado>(BASE, dados);
}

export function publicarQuebraCabeca(id: string): Promise<QuebraCabecaCriado> {
  return api.enviar<QuebraCabecaCriado>(`${BASE}/${encodeURIComponent(id)}/publicar`);
}

export function detalharQuebraCabeca(id: string): Promise<QuebraCabecaAdmin> {
  return api.obter<QuebraCabecaAdmin>(`${BASE}/${encodeURIComponent(id)}`);
}

export function editarQuebraCabeca(
  id: string,
  dados: EditarQuebraCabeca,
): Promise<QuebraCabecaCriado> {
  return api.atualizar<QuebraCabecaCriado>(`${BASE}/${encodeURIComponent(id)}`, dados);
}
