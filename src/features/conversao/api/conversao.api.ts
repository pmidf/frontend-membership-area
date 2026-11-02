import { api } from "@/shared/api/cliente-http";

export type OrigemConversao = "VITRINE" | "BENEFICIOS" | "CONTEUDO";

export function registrarCliqueConversao(origem: OrigemConversao): Promise<void> {
  return api.enviar<void>("/conversao/cta", { origem });
}
