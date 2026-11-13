import { diasAte, hojeNoFuso } from "@/shared/lib/datas";

const DIAS_COMO_NOVO = 14;

export function ehNovo(dataPublicacao: string | null, agora: Date = new Date()): boolean {
  if (!dataPublicacao) return false;
  return -diasAte(hojeNoFuso(new Date(dataPublicacao)), agora) <= DIAS_COMO_NOVO;
}
