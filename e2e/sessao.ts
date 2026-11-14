import type { Page } from "@playwright/test";

import type { Perfil } from "../src/shared/sessao/tipos";

export async function simularSessao(page: Page, perfil: Perfil | null) {
  await page.route("**/api/auth/refresh", (rota) =>
    perfil
      ? rota.fulfill({ json: { access_token: "token-e2e", expira_em_segundos: 900 } })
      : rota.fulfill({ status: 401, json: { codigo: "SESSAO_INVALIDA" } }),
  );
  await page.route("**/api/me", (rota) =>
    perfil ? rota.fulfill({ json: perfil }) : rota.fulfill({ status: 401 }),
  );
  await page.route("**/api/auth/logout", (rota) => rota.fulfill({ status: 204 }));
}
