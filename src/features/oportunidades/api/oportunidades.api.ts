import { api } from "@/shared/api/cliente-http";

import type {
  Candidatura,
  DetalheOportunidade,
  FiltrosOportunidades,
  RespostaOportunidades,
} from "../tipos/oportunidade";

const CAMINHO = "/oportunidades";
const caminhoOportunidade = (id: string) => `${CAMINHO}/${encodeURIComponent(id)}`;

export function listarOportunidades(
  filtros: FiltrosOportunidades = {},
): Promise<RespostaOportunidades> {
  return api.obter<RespostaOportunidades>(CAMINHO, { consulta: filtros });
}

export function detalharOportunidade(id: string): Promise<DetalheOportunidade> {
  return api.obter<DetalheOportunidade>(caminhoOportunidade(id));
}

export function solicitarCandidatura(id: string): Promise<Candidatura> {
  return api.enviar<Candidatura>(`${caminhoOportunidade(id)}/candidatura`);
}
