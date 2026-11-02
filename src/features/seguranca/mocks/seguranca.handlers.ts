import { http, HttpResponse } from "msw/http";

import type { SessaoAtiva } from "../api/seguranca.api";

export const SENHA_ATUAL_TESTE = "SenhaAtual2026!";

export const sessoesTeste: SessaoAtiva[] = [
  {
    id_sessao: "5b0c2f3e-1d4a-4c8b-9e7f-0a1b2c3d4e5f",
    ip: "177.10.20.30",
    user_agent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    data_criacao: "2026-11-01T10:00:00.000Z",
    data_ultimo_uso: "2026-11-02T14:00:00.000Z",
    atual: true,
  },
  {
    id_sessao: "8d7e6f5a-4b3c-4d2e-8f1a-9b8c7d6e5f4a",
    ip: "189.40.50.60",
    user_agent:
      "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
    data_criacao: "2026-10-20T08:00:00.000Z",
    data_ultimo_uso: "2026-10-30T09:00:00.000Z",
    atual: false,
  },
];

export function handlersSeguranca(iniciais: SessaoAtiva[] = sessoesTeste) {
  let sessoes = [...iniciais];
  return [
    http.get("*/api/me/sessoes", () => HttpResponse.json(sessoes)),
    http.delete("*/api/me/sessoes/:id", ({ params }) => {
      const existe = sessoes.some((sessao) => sessao.id_sessao === params.id);
      if (!existe) return new HttpResponse(null, { status: 404 });
      sessoes = sessoes.filter((sessao) => sessao.id_sessao !== params.id);
      return new HttpResponse(null, { status: 204 });
    }),
    http.delete("*/api/me/sessoes", ({ request }) => {
      if (new URL(request.url).searchParams.get("outras") !== "true") {
        return HttpResponse.json({ codigo: "DADOS_INVALIDOS" }, { status: 422 });
      }
      sessoes = sessoes.filter((sessao) => sessao.atual);
      return new HttpResponse(null, { status: 204 });
    }),
    http.put("*/api/me/senha", async ({ request }) => {
      const { senha_atual } = (await request.json()) as { senha_atual: string };
      if (senha_atual !== SENHA_ATUAL_TESTE) {
        return HttpResponse.json({ codigo: "SENHA_ATUAL_INCORRETA" }, { status: 422 });
      }
      sessoes = sessoes.filter((sessao) => sessao.atual);
      return new HttpResponse(null, { status: 204 });
    }),
  ];
}
