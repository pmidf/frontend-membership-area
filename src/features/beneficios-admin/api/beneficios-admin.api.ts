import { baixarArquivo } from "@/shared/api/baixar-arquivo";
import { api } from "@/shared/api/cliente-http";
import type { Pagina } from "@/shared/api/tipos";
import { hojeNoFuso } from "@/shared/lib/datas";

import type {
  ConsultaBeneficiosAdmin,
  FiltrosBeneficiosAdmin,
  ItemBeneficioAdmin,
} from "../tipos/beneficio-admin";

export function listarBeneficiosAdmin(
  consulta: ConsultaBeneficiosAdmin = {},
): Promise<Pagina<ItemBeneficioAdmin>> {
  return api.obter<Pagina<ItemBeneficioAdmin>>("/admin/beneficios", { consulta });
}

export function exportarBeneficios(filtros: FiltrosBeneficiosAdmin): Promise<string> {
  return baixarArquivo("/admin/beneficios/export.csv", `beneficios-${hojeNoFuso()}.csv`, filtros);
}
