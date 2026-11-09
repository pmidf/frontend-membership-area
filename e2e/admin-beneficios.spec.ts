import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import {
  beneficiosAdminTeste,
  filtrarBeneficiosAdmin,
} from "../src/features/beneficios-admin/mocks/beneficios-admin.handlers";
import { perfilAdmin } from "../src/test/fixtures/pessoas";

import { simularSessao } from "./sessao";

async function abrir(page: Page, caminho = "/admin/beneficios") {
  await simularSessao(page, perfilAdmin);
  await page.route("**/api/admin/beneficios*", (rota) =>
    rota.fulfill({
      json: filtrarBeneficiosAdmin(beneficiosAdminTeste, new URL(rota.request().url())),
    }),
  );
  await page.goto(caminho);
  await expect(page.getByRole("heading", { name: "Benefícios", level: 1 })).toBeVisible();
}

test("o Admin vê a lista e filtra por status", async ({ page }, info) => {
  await abrir(page);
  await expect(page.getByText("Página 1 de 2")).toBeVisible();
  await page.screenshot({
    path: `test-results/capturas/admin-beneficios-${info.project.name}.png`,
    animations: "disabled",
    fullPage: true,
  });
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual(
    [],
  );

  await page.getByRole("combobox", { name: "Status" }).selectOption("ARQUIVADO");
  await expect(page).toHaveURL(/\?situacao=ARQUIVADO$/);
  await expect(page.getByRole("link", { name: "Ver Curso de liderança" })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Editar / })).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole("combobox", { name: "Status" })).toHaveValue("ARQUIVADO");
});

test("exporta o CSV com o nome do dia e os filtros aplicados", async ({ page }) => {
  await simularSessao(page, perfilAdmin);
  await page.route("**/api/admin/beneficios*", (rota) =>
    rota.fulfill({
      json: filtrarBeneficiosAdmin(beneficiosAdminTeste, new URL(rota.request().url())),
    }),
  );
  let consulta = "";
  await page.route("**/api/admin/beneficios/export.csv*", (rota) => {
    consulta = new URL(rota.request().url()).search;
    return rota.fulfill({
      body: "título\nA",
      contentType: "text/csv",
      headers: { "Content-Disposition": 'attachment; filename="beneficios-2026-11-09.csv"' },
    });
  });
  await page.goto("/admin/beneficios?situacao=PUBLICADO&ordenar=resgates_desc");
  await expect(page.getByRole("heading", { name: "Benefícios", level: 1 })).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Exportar CSV" }).click(),
  ]);

  expect(download.suggestedFilename()).toBe("beneficios-2026-11-09.csv");
  expect(consulta).toBe("?situacao=PUBLICADO");
  await expect(page.getByText("CSV exportado")).toBeVisible();
});

test("o botão Novo benefício leva à rota provisória de cadastro", async ({ page }) => {
  await abrir(page);

  await page.getByRole("link", { name: "Novo benefício" }).click();

  await expect(page).toHaveURL(/\/admin\/beneficios\/novo$/);
  await expect(page.getByText("Em construção")).toBeVisible();
});
