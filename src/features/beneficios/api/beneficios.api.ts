import { api, requisicaoComStatus } from "@/shared/api/cliente-http";

import type {
  DetalheBeneficio,
  FiltrosBeneficios,
  ResgateBeneficio,
  RespostaBeneficios,
} from "../tipos/beneficio";

export type ResultadoResgate = { resgate: ResgateBeneficio; novo: boolean };

export function listarBeneficios(filtros: FiltrosBeneficios = {}): Promise<RespostaBeneficios> {
  return api.obter<RespostaBeneficios>("/beneficios", { consulta: filtros });
}

export function detalharBeneficio(id: string): Promise<DetalheBeneficio> {
  return api.obter<DetalheBeneficio>(`/beneficios/${encodeURIComponent(id)}`);
}

export async function resgatarBeneficio(id: string): Promise<ResultadoResgate> {
  const { status, dados } = await requisicaoComStatus<ResgateBeneficio>(
    `/beneficios/${encodeURIComponent(id)}/resgate`,
    { metodo: "POST" },
  );
  return { resgate: dados, novo: status === 201 };
}
