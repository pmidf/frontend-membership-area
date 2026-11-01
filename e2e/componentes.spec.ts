import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api", (rota) => rota.fulfill({ status: 200, body: "Hello World!" }));
  await page.goto("/_componentes");
});

test("apresenta o catálogo do design system", async ({ page }, info) => {
  await expect(page.getByRole("heading", { name: "Componentes", level: 1 })).toBeVisible();
  await expect(page.getByRole("region", { name: "Botões" })).toBeVisible();
  await page.screenshot({
    path: `test-results/capturas/componentes-${info.project.name}.png`,
    fullPage: true,
  });
});

test("o catálogo não tem violações sérias de acessibilidade", async ({ page }) => {
  const { violations } = await new AxeBuilder({ page }).analyze();
  const graves = violations.filter(({ impact }) => impact === "serious" || impact === "critical");

  expect(graves).toEqual([]);
});

test("o campo de código aceita o código colado", async ({ page }) => {
  const primeiro = page.getByRole("textbox", { name: "Dígito 1 de 6" }).first();
  await primeiro.click();
  await page.keyboard.press("Backspace");
  await page.keyboard.press("Backspace");
  await page.keyboard.type("987654");

  await expect(page.getByRole("textbox", { name: "Dígito 6 de 6" }).first()).toHaveValue("4");
});
