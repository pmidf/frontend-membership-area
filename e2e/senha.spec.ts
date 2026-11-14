import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { simularSessao } from "./sessao";

async function semViolacoesGraves(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual(
    [],
  );
}

test("pede as instruções e recebe a resposta neutra", async ({ page }, info) => {
  await simularSessao(page, null);
  await page.route("**/api/auth/senha/esqueci", (rota) => rota.fulfill({ status: 202 }));

  await page.goto("/login");
  await page.getByRole("link", { name: "Esqueci minha senha" }).click();
  await expect(page.getByRole("heading", { name: "Esqueceu a senha?" })).toBeVisible();
  await page.screenshot({
    path: `test-results/capturas/esqueci-senha-${info.project.name}.png`,
    animations: "disabled",
  });
  await semViolacoesGraves(page);

  await page.getByRole("textbox", { name: "E-mail" }).fill("maria@teste.pmidf.org.br");
  await page.getByRole("button", { name: "Enviar instruções" }).click();

  await expect(page.getByRole("heading", { name: "Verifique seu e-mail" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Enviar de novo \(disponível em/ })).toBeDisabled();
  await page.screenshot({
    path: `test-results/capturas/instrucoes-enviadas-${info.project.name}.png`,
    animations: "disabled",
  });
});

test("redefine a senha com um link válido e volta ao login", async ({ page }, info) => {
  await simularSessao(page, null);
  await page.route("**/api/auth/senha/redefinir/validar?**", (rota) =>
    rota.fulfill({ json: { valido: true } }),
  );
  await page.route("**/api/auth/senha/redefinir", (rota) => rota.fulfill({ status: 204 }));

  await page.goto("/redefinir-senha?token=token-e2e");
  await expect(page.getByRole("heading", { name: "Crie uma nova senha" })).toBeVisible();
  await page.getByLabel("Nova senha", { exact: true }).fill("SenhaForte2026!");
  await page.getByLabel("Confirmar nova senha", { exact: true }).fill("SenhaForte2026!");
  await expect(page.getByText("Força da senha: forte")).toBeVisible();
  await page.screenshot({
    path: `test-results/capturas/nova-senha-${info.project.name}.png`,
    animations: "disabled",
  });
  await semViolacoesGraves(page);

  await page.getByRole("button", { name: "Salvar nova senha" }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText("Senha alterada. Entre com a nova senha.")).toBeVisible();
});

test("mostra o link inválido e leva a um novo pedido", async ({ page }, info) => {
  await simularSessao(page, null);
  await page.route("**/api/auth/senha/redefinir/validar?**", (rota) =>
    rota.fulfill({ json: { valido: false } }),
  );

  await page.goto("/redefinir-senha?token=token-usado");
  await expect(page.getByRole("heading", { name: "Este link não vale mais" })).toBeVisible();
  await page.screenshot({
    path: `test-results/capturas/link-invalido-${info.project.name}.png`,
    animations: "disabled",
  });
  await semViolacoesGraves(page);

  await page.getByRole("link", { name: "Pedir novo link" }).click();
  await expect(page).toHaveURL(/\/esqueci-senha$/);
});
