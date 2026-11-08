import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { previaTeste } from "../src/features/beneficios/mocks/beneficios.handlers";
import type { Perfil } from "../src/shared/sessao/tipos";
import { perfilNaoFiliado } from "../src/test/fixtures/pessoas";

import { simularSessao } from "./sessao";

async function abrirPrevia(page: Page, perfil: Perfil | null) {
  await simularSessao(page, perfil);
  await page.route("**/api/beneficios", (rota) => rota.fulfill({ json: previaTeste }));
  await page.goto("/beneficios");
  await expect(page.getByRole("region", { name: "Exclusivo para filiados" })).toBeVisible();
}

test("o visitante vê a prévia desfocada, sem cartões focáveis", async ({ page }, info) => {
  await abrirPrevia(page, null);

  await expect(page.locator("[data-bloqueado='true']")).toHaveCount(6);
  await page.screenshot({
    path: `test-results/capturas/beneficios-previa-${info.project.name}.png`,
    animations: "disabled",
    fullPage: true,
  });
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual(
    [],
  );

  for (let tecla = 0; tecla < 25; tecla += 1) {
    await page.keyboard.press("Tab");
    const dentroDoCartao = await page.evaluate(
      () => document.activeElement?.closest("[data-bloqueado='true']") !== null,
    );
    expect(dentroDoCartao).toBe(false);
  }
});

test("o Não-Filiado que abre um benefício direto volta para a prévia", async ({ page }) => {
  await simularSessao(page, perfilNaoFiliado);
  await page.route("**/api/beneficios", (rota) => rota.fulfill({ json: previaTeste }));
  await page.route("**/api/beneficios/*", (rota) =>
    rota.fulfill({ status: 403, json: { codigo: "FILIACAO_NECESSARIA" } }),
  );

  await page.goto("/beneficios/20000000-0000-4000-8000-000000000001");

  await expect(page).toHaveURL(/\/beneficios$/);
  await expect(page.getByRole("region", { name: "Exclusivo para filiados" })).toBeVisible();
});
