import type { TipoResgate } from "@/features/beneficios/tipos/beneficio";
import { formatarDataCivil, formatarDiaMes } from "@/shared/lib/datas";

import type { ItemBeneficioAdmin, VigenciaBeneficio } from "../tipos/beneficio-admin";

export const rotulosFormaResgate: Record<TipoResgate, string> = {
  CUPOM: "Cupom compartilhado",
  INSTRUCAO: "Instrução por texto",
};

export const rotulosVigencia: Record<VigenciaBeneficio, string> = {
  VIGENTE: "Vigente",
  FUTURA: "Futura",
  ENCERRADA: "Encerrada",
};

export function textoVigencia({
  vigencia_inicio,
  vigencia_fim,
}: Pick<ItemBeneficioAdmin, "vigencia_inicio" | "vigencia_fim">): string {
  if (!vigencia_fim) return "Sem data de término";
  return `${formatarDiaMes(vigencia_inicio)} a ${formatarDataCivil(vigencia_fim)}`;
}
