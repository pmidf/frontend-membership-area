import { http, HttpResponse } from "msw/http";

import { perfilPendente } from "@/test/fixtures/pessoas";

import type { MinhaFiliacao, RespostaVinculacao } from "../api/filiacao.api";

export const PMI_ID_APROVADO = "1000001";
export const PMI_ID_COM_OUTRO_EMAIL = "2000002";
export const PMI_ID_NAO_LOCALIZADO = "5555555";
export const CODIGO_PMI_CORRETO = "123456";
export const EMAIL_PMI_MASCARADO = "ma***@empresa.com";

export const minhaFiliacaoPendente: MinhaFiliacao = {
  ...perfilPendente.filiacao!,
  email_pmi_mascarado: null,
  proxima_atualizacao_em: null,
};

export const minhaFiliacaoAguardandoCodigo: MinhaFiliacao = {
  ...minhaFiliacaoPendente,
  situacao: "AGUARDANDO_CODIGO",
  motivo_pendencia: null,
  email_pmi_mascarado: EMAIL_PMI_MASCARADO,
};

const aprovada: RespostaVinculacao = {
  situacao: "APROVADO",
  resultado: "APROVADO",
  proxima_atualizacao_em: null,
};

function respostaPara(pmi_id: string): RespostaVinculacao {
  if (pmi_id === PMI_ID_APROVADO) return aprovada;
  if (pmi_id === PMI_ID_COM_OUTRO_EMAIL) {
    return {
      situacao: "AGUARDANDO_CODIGO",
      resultado: "CODIGO_ENVIADO",
      email_pmi_mascarado: EMAIL_PMI_MASCARADO,
      proxima_atualizacao_em: null,
    };
  }
  if (pmi_id === PMI_ID_NAO_LOCALIZADO) {
    return { situacao: "PENDENTE", resultado: "NAO_LOCALIZADO", proxima_atualizacao_em: null };
  }
  return { situacao: "SEM_VINCULO", resultado: "DADOS_NAO_CONFEREM", proxima_atualizacao_em: null };
}

export function handlersFiliacao(minha: MinhaFiliacao = minhaFiliacaoPendente) {
  return [
    http.get("*/api/me/filiacao", () => HttpResponse.json(minha)),
    http.post("*/api/me/filiacao/vincular", async ({ request }) => {
      const { pmi_id } = (await request.json()) as { pmi_id: string };
      return HttpResponse.json(respostaPara(pmi_id));
    }),
    http.post("*/api/me/filiacao/atualizar", () => HttpResponse.json(aprovada)),
    http.post("*/api/me/filiacao/codigo/confirmar", async ({ request }) => {
      const { codigo } = (await request.json()) as { codigo: string };
      if (codigo !== CODIGO_PMI_CORRETO) {
        return HttpResponse.json({ codigo: "CODIGO_INVALIDO" }, { status: 422 });
      }
      return HttpResponse.json({ situacao: "APROVADO", resultado: "APROVADO" });
    }),
    http.post("*/api/me/filiacao/codigo/reenviar", () =>
      HttpResponse.json({ email_pmi_mascarado: EMAIL_PMI_MASCARADO }),
    ),
  ];
}
