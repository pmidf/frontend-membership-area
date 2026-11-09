import type { TipoResgate } from "@/features/beneficios/tipos/beneficio";
import { formatarDataCivil, formatarDiaMes } from "@/shared/lib/datas";
import type { Tom } from "@/shared/ui";

import type {
  ItemBeneficioAdmin,
  SituacaoBeneficio,
  VigenciaBeneficio,
} from "../tipos/beneficio-admin";

export const rotulosSituacao: Record<SituacaoBeneficio, { rotulo: string; tom: Tom }> = {
  RASCUNHO: { rotulo: "Rascunho", tom: "neutro" },
  PUBLICADO: { rotulo: "Publicado", tom: "aqua" },
  ARQUIVADO: { rotulo: "Arquivado", tom: "alerta" },
};

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
