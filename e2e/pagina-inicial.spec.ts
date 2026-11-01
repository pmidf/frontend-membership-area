import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api", (rota) => rota.fulfill({ status: 200, body: "Hello World!" }));
  await page.goto("/");
});

test("apresenta a área de membros e o estado da API", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Área de Membros PMI-DF" })).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("API disponível");
});

test("não tem violações sérias de acessibilidade", async ({ page }) => {
  await expect(page.getByRole("status")).toHaveText("API disponível");
  const { violations } = await new AxeBuilder({ page }).analyze();
  const graves = violations.filter(({ impact }) => impact === "serious" || impact === "critical");

  expect(graves).toEqual([]);
});
