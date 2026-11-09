import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

import type { ConsultaBeneficiosAdmin, SituacaoBeneficio } from "../tipos/beneficio-admin";
import { exportarBeneficios, listarBeneficiosAdmin } from "./beneficios-admin.api";

export const chavesBeneficiosAdmin = {
  todas: ["beneficios-admin"] as const,
  lista: (consulta: ConsultaBeneficiosAdmin) => ["beneficios-admin", "lista", consulta] as const,
  total: (situacao: SituacaoBeneficio) => ["beneficios-admin", "total", situacao] as const,
};

export function useBeneficiosAdmin(consulta: ConsultaBeneficiosAdmin) {
  return useQuery({
    queryKey: chavesBeneficiosAdmin.lista(consulta),
    queryFn: () => listarBeneficiosAdmin(consulta),
    placeholderData: keepPreviousData,
  });
}

export function useTotalPorSituacao(situacao: SituacaoBeneficio) {
  return useQuery({
    queryKey: chavesBeneficiosAdmin.total(situacao),
    queryFn: () => listarBeneficiosAdmin({ situacao }),
    select: (pagina) => pagina.total,
  });
}

export function useExportarBeneficios() {
  return useMutation({ mutationFn: exportarBeneficios });
}
