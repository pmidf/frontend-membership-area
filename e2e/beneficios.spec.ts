import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import {
  detalheTeste,
  filtrarLista,
  itensTeste,
  previaTeste,
} from "../src/features/beneficios/mocks/beneficios.handlers";
import type { Perfil } from "../src/shared/sessao/tipos";
import { perfilFiliado, perfilNaoFiliado } from "../src/test/fixtures/pessoas";

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

test("o Filiado busca no catálogo, abre um benefício e volta com os filtros", async ({
  page,
}, info) => {
  await simularSessao(page, perfilFiliado);
  await page.route("**/api/beneficios*", (rota) =>
    rota.fulfill({ json: filtrarLista(itensTeste, new URL(rota.request().url())) }),
  );
  await page.route("**/api/beneficios/*", (rota) => rota.fulfill({ json: detalheTeste }));

  await page.goto("/beneficios");
  const lista = page.getByRole("list", { name: "Benefícios" });
  await expect(lista.getByRole("listitem")).toHaveCount(20);
  await page.screenshot({
    path: `test-results/capturas/beneficios-catalogo-${info.project.name}.png`,
    animations: "disabled",
    fullPage: true,
  });
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual(
    [],
  );

  await page.getByRole("searchbox").fill("PMP");
  await expect(page).toHaveURL(/\?q=PMP$/);
  await expect(lista.getByRole("listitem")).toHaveCount(2);

  await lista.getByRole("link", { name: "30% em cursos de preparação PMP" }).click();
  await expect(page).toHaveURL(/\/beneficios\/[0-9a-f-]+\?q=PMP$/);
  await expect(page.getByRole("heading", { name: detalheTeste.titulo, level: 1 })).toBeVisible();
  await page.screenshot({
    path: `test-results/capturas/beneficios-detalhe-${info.project.name}.png`,
    animations: "disabled",
    fullPage: true,
  });

  await page.getByRole("link", { name: "Voltar para o clube de benefícios" }).click();
  await expect(page).toHaveURL(/\/beneficios\?q=PMP$/);
  await expect(page.getByRole("searchbox")).toHaveValue("PMP");
});
