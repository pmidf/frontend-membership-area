import { api } from "@/shared/api/cliente-http";

import type { DetalheConcluido, PainelGamificacao } from "../tipos/gamificacao";

export function obterPainel(): Promise<PainelGamificacao> {
  return api.obter<PainelGamificacao>("/gamificacao");
}

export function detalharConcluido(progressoId: string): Promise<DetalheConcluido> {
  return api.obter<DetalheConcluido>(`/gamificacao/concluidos/${encodeURIComponent(progressoId)}`);
}
