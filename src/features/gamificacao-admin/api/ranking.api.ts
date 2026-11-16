import { api } from "@/shared/api/cliente-http";

import type { LinhaRanking } from "../tipos/quebra-cabeca-admin";

export function obterRanking(): Promise<LinhaRanking[]> {
  return api.obter<LinhaRanking[]>("/admin/gamificacao/ranking");
}
