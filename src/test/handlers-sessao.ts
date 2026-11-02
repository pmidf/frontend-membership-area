import { http, HttpResponse } from "msw/http";

import type { Perfil } from "@/shared/sessao/tipos";

export const TOKEN_TESTE = "token-de-teste";

export function handlersSessao(perfil: Perfil | null) {
  return [
    http.post("*/api/auth/refresh", () =>
      perfil
        ? HttpResponse.json({ access_token: TOKEN_TESTE, expira_em_segundos: 900 })
        : new HttpResponse(null, { status: 401 }),
    ),
    http.get("*/api/me", ({ request }) =>
      perfil && request.headers.get("Authorization") === `Bearer ${TOKEN_TESTE}`
        ? HttpResponse.json(perfil)
        : new HttpResponse(null, { status: 401 }),
    ),
    http.post("*/api/auth/logout", () => new HttpResponse(null, { status: 204 })),
  ];
}
