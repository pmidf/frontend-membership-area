import { diasAte, formatarDataCivil } from "@/shared/lib/datas";

export type SituacaoValidade = { texto: string; urgente: boolean };

const DIAS_PARA_URGENCIA = 7;

export function situacaoValidade(
  vigenciaFim: string | null,
  agora: Date = new Date(),
): SituacaoValidade {
  if (!vigenciaFim) return { texto: "Sem data de término", urgente: false };

  const dias = diasAte(vigenciaFim, agora);
  if (dias > DIAS_PARA_URGENCIA) {
    return { texto: `Válido até ${formatarDataCivil(vigenciaFim)}`, urgente: false };
  }
  if (dias <= 0) return { texto: "Termina hoje", urgente: true };
  return { texto: dias === 1 ? "Termina em 1 dia" : `Termina em ${dias} dias`, urgente: true };
}
