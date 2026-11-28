import type { ResultadoVinculacao } from "@/features/auth/api/auth.api";
import { api } from "@/shared/api/cliente-http";
import type { FiliacaoPerfil, SituacaoFiliacao } from "@/shared/sessao/tipos";

export type MinhaFiliacao = FiliacaoPerfil & {
  email_pmi_mascarado: string | null;
  proxima_atualizacao_em: string | null;
};

export type RespostaVinculacao = {
  situacao: SituacaoFiliacao;
  resultado: ResultadoVinculacao | null;
  email_pmi_mascarado?: string;
  proxima_atualizacao_em: string | null;
};

export type CodigoConfirmado = { situacao: SituacaoFiliacao; resultado: ResultadoVinculacao };

export type CodigoReenviado = { email_pmi_mascarado: string };

export function buscarMinhaFiliacao(): Promise<MinhaFiliacao> {
  return api.obter<MinhaFiliacao>("/me/filiacao");
}

export function vincularFiliacao(pmi_id: string): Promise<RespostaVinculacao> {
  return api.enviar<RespostaVinculacao>("/me/filiacao/vincular", { pmi_id });
}

export function atualizarFiliacao(pmi_id?: string): Promise<RespostaVinculacao> {
  return api.enviar<RespostaVinculacao>("/me/filiacao/atualizar", pmi_id ? { pmi_id } : {});
}

export function confirmarCodigoPmi(codigo: string): Promise<CodigoConfirmado> {
  return api.enviar<CodigoConfirmado>("/me/filiacao/codigo/confirmar", { codigo });
}

export function reenviarCodigoPmi(): Promise<CodigoReenviado> {
  return api.enviar<CodigoReenviado>("/me/filiacao/codigo/reenviar");
}
