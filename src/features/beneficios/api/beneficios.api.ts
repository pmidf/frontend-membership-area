import { api } from "@/shared/api/cliente-http";

import type { DetalheBeneficio, FiltrosBeneficios, RespostaBeneficios } from "../tipos/beneficio";

export function listarBeneficios(filtros: FiltrosBeneficios = {}): Promise<RespostaBeneficios> {
  return api.obter<RespostaBeneficios>("/beneficios", { consulta: filtros });
}

export function detalharBeneficio(id: string): Promise<DetalheBeneficio> {
  return api.obter<DetalheBeneficio>(`/beneficios/${encodeURIComponent(id)}`);
}
