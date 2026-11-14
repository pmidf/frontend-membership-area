import { api } from "@/shared/api/cliente-http";

import type {
  DetalheConcluido,
  PainelGamificacao,
  QuebraCabecaSorteado,
} from "../tipos/gamificacao";

export function sortearQuebraCabeca(): Promise<QuebraCabecaSorteado> {
  return api.enviar<QuebraCabecaSorteado>("/gamificacao/sortear-quebra-cabeca");
}

export function obterPainel(): Promise<PainelGamificacao> {
  return api.obter<PainelGamificacao>("/gamificacao");
}

export function detalharConcluido(progressoId: string): Promise<DetalheConcluido> {
  return api.obter<DetalheConcluido>(`/gamificacao/concluidos/${encodeURIComponent(progressoId)}`);
}
