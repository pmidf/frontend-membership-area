import { http, HttpResponse } from "msw/http";

import type { Perfil } from "@/shared/sessao/tipos";
import { perfilFiliado } from "@/test/fixtures/pessoas";

import type { AtualizarPreferencias, Preferencias } from "../api/preferencias.api";

export const SENHA_EXCLUSAO_TESTE = "SenhaForte2026!";

export const preferenciasTeste: Preferencias = {
  gamificacao: true,
  email_marketing: false,
  exibir_vitrine: false,
};

export function handlersPreferencias(
  perfil: Perfil = perfilFiliado,
  inicial: Preferencias = preferenciasTeste,
) {
  let preferencias = inicial;
  return [
    http.get("*/api/me/preferencias", () => HttpResponse.json(preferencias)),
    http.patch("*/api/me/preferencias", async ({ request }) => {
      const alteracao = (await request.json()) as AtualizarPreferencias;
      if (alteracao.exibir_vitrine && !perfil.papeis.filiado) {
        return HttpResponse.json({ codigo: "FILIACAO_NECESSARIA" }, { status: 403 });
      }
      preferencias = { ...preferencias, ...alteracao };
      return HttpResponse.json(preferencias);
    }),
  ];
}

export function handlersPerfil(perfilInicial: Perfil = perfilFiliado) {
  let perfil = perfilInicial;
  return [
    ...handlersPreferencias(perfilInicial),
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
