import { api } from "@/shared/api/cliente-http";

import type {
  CriarQuebraCabeca,
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
