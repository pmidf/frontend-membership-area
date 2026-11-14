import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { perfilAdmin } from "../src/test/fixtures/pessoas";

import { simularSessao } from "./sessao";

test("a tela de login é acessível e mostra o erro genérico de credenciais", async ({
  page,
}, info) => {
  await simularSessao(page, null);
  await page.route("**/api/auth/login", (rota) =>
    rota.fulfill({ status: 401, json: { codigo: "CREDENCIAIS_INVALIDAS" } }),
  );
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Bem-vindo de volta", level: 1 })).toBeVisible();
  await page.screenshot({
    path: `test-results/capturas/login-${info.project.name}.png`,
    animations: "disabled",
  });
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual(
    [],
  );

  await page.getByLabel("E-mail").fill("maria@teste.pmidf.org.br");
  await page.getByLabel("Senha", { exact: true }).fill("senha-errada");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(
    page.getByRole("alert").filter({ hasText: "E-mail ou senha inválidos." }),
  ).toBeVisible();
  await expect(page.getByLabel("Senha", { exact: true })).toHaveValue("");
  await page.screenshot({
    path: `test-results/capturas/login-erro-${info.project.name}.png`,
    animations: "disabled",
  });
});

test("o login leva ao destino pedido com a casca do Admin", async ({ page }) => {
  let logado = false;
  await page.route("**/api/auth/refresh", (rota) =>
    logado
      ? rota.fulfill({ json: { access_token: "token-e2e", expira_em_segundos: 900 } })
      : rota.fulfill({ status: 401, json: { codigo: "SESSAO_INVALIDA" } }),
  );
  await page.route("**/api/me", (rota) => rota.fulfill({ json: perfilAdmin }));
  await page.route("**/api/auth/login", (rota) => {
    logado = true;
    return rota.fulfill({ json: { access_token: "token-e2e", expira_em_segundos: 900 } });
  });

  await page.goto("/conquistas");
  await expect(page).toHaveURL(/\/login\?redirecionar=%2Fconquistas$/);

  await page.getByLabel("E-mail").fill("admin@pmidf.org.br");
  await page.getByLabel("Senha", { exact: true }).fill("AdminLocal2026!");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/\/conquistas$/);
  await expect(page.getByRole("heading", { name: "Minhas conquistas", level: 1 })).toBeVisible();
});
