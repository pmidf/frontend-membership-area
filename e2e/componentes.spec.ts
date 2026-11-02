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

test("o modal prende o foco, fecha com Esc e devolve o foco ao gatilho", async ({ page }, info) => {
  const gatilho = page.getByRole("button", { name: "Abrir modal" });
  await gatilho.click();

  const dialogo = page.getByRole("dialog", { name: "Seu código está pronto" });
  await expect(dialogo).toBeVisible();
  await page.screenshot({ path: `test-results/capturas/modal-${info.project.name}.png` });
  const { violations } = await new AxeBuilder({ page }).include("dialog").analyze();
  expect(violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual(
    [],
  );

  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(dialogo.getByRole("button", { name: "Fechar" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialogo).toBeHidden();
  await expect(gatilho).toBeFocused();
});

test("o aviso aparece e some sozinho", async ({ page }) => {
  await page.getByRole("button", { name: "Aviso de sucesso" }).click();
  const regiao = page.getByRole("region", { name: "Avisos", exact: true });

  await expect(regiao).toContainText("Vaga publicada");
  await expect(regiao).not.toContainText("Vaga publicada", { timeout: 7000 });
});

test("o campo de código aceita o código colado", async ({ page }) => {
  const primeiro = page.getByRole("textbox", { name: "Dígito 1 de 6" }).first();
  await primeiro.click();
  await page.keyboard.press("Backspace");
  await page.keyboard.press("Backspace");
  await page.keyboard.type("987654");

  await expect(page.getByRole("textbox", { name: "Dígito 6 de 6" }).first()).toHaveValue("4");
});

test("a prévia freemium deixa fora do teclado só os itens bloqueados", async ({ page }, info) => {
  const secao = page.getByRole("region", { name: "Freemium" });
  await secao.screenshot({ path: `test-results/capturas/freemium-${info.project.name}.png` });

  await expect(secao.getByText("2 conteúdos exclusivos para filiados")).toBeAttached();
  await expect(secao.locator("[data-bloqueado]")).toHaveCount(2);
  await expect(secao.locator("[data-bloqueado]").first()).toHaveAttribute("inert", "");
  await expect(secao.getByRole("link", { name: /Quero ser filiado/ }).first()).toHaveAttribute(
    "target",
    "_blank",
  );
});
