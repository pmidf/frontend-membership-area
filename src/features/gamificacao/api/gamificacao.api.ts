import { api } from "@/shared/api/cliente-http";

import type {
  Creditos,
  DetalheConcluido,
  PainelGamificacao,
  PecaSorteada,
  QuebraCabecaSorteado,
} from "../tipos/gamificacao";

export function sortearPeca(): Promise<PecaSorteada> {
  return api.enviar<PecaSorteada>("/gamificacao/sortear-peca");
}

export function sincronizarCreditos(): Promise<Creditos> {
  return api.obter<Creditos>("/gamificacao/creditos");
}

export function sortearQuebraCabeca(): Promise<QuebraCabecaSorteado> {
  return api.enviar<QuebraCabecaSorteado>("/gamificacao/sortear-quebra-cabeca");
}

export function obterPainel(): Promise<PainelGamificacao> {
  return api.obter<PainelGamificacao>("/gamificacao");
}

export function detalharConcluido(progressoId: string): Promise<DetalheConcluido> {
  return api.obter<DetalheConcluido>(`/gamificacao/concluidos/${encodeURIComponent(progressoId)}`);
}
