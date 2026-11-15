import { diasAte, diasDesde } from "@/shared/lib/datas";

export const DIAS_PARA_ENCERRAR_EM_BREVE = 5;

export function textoPublicacao(dataPublicacao: string, agora: Date = new Date()): string {
  return `Publicada ${diasDesde(dataPublicacao, agora).toLowerCase()}`;
}

export function textoExpiracao(dataEncerramento: string | null, agora: Date = new Date()): string {
  if (!dataEncerramento) return "sem prazo";
  const dias = diasAte(dataEncerramento, agora);
  if (dias <= 0) return "expira hoje";
  return dias === 1 ? "expira amanhã" : `expira em ${dias} dias`;
}

export function encerraEmBreve(dataEncerramento: string | null, agora: Date = new Date()): boolean {
  if (!dataEncerramento) return false;
  const dias = diasAte(dataEncerramento, agora);
  return dias >= 0 && dias <= DIAS_PARA_ENCERRAR_EM_BREVE;
}
