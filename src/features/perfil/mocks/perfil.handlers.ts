import { http, HttpResponse } from "msw/http";

import type { Perfil } from "@/shared/sessao/tipos";
import { perfilFiliado } from "@/test/fixtures/pessoas";

export function handlersPerfil(perfilInicial: Perfil = perfilFiliado) {
  let perfil = perfilInicial;
  return [
    http.patch("*/api/me", async ({ request }) => {
      perfil = { ...perfil, ...((await request.json()) as Partial<Perfil>) };
      return HttpResponse.json(perfil);
    }),
  ];
}
