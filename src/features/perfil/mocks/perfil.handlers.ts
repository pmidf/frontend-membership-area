import { http, HttpResponse } from "msw/http";

import type { Perfil } from "@/shared/sessao/tipos";
import { perfilFiliado } from "@/test/fixtures/pessoas";

export const SENHA_EXCLUSAO_TESTE = "SenhaForte2026!";

export function handlersPerfil(perfilInicial: Perfil = perfilFiliado) {
  let perfil = perfilInicial;
  return [
    http.patch("*/api/me", async ({ request }) => {
      perfil = { ...perfil, ...((await request.json()) as Partial<Perfil>) };
      return HttpResponse.json(perfil);
    }),
    http.delete("*/api/me", async ({ request }) => {
      const { senha } = (await request.json()) as { senha: string };
      return senha === SENHA_EXCLUSAO_TESTE
        ? new HttpResponse(null, { status: 204 })
        : HttpResponse.json({ codigo: "SENHA_INCORRETA" }, { status: 422 });
    }),
  ];
}
