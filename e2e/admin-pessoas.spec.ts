import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import {
  filtrarPessoas,
  pessoasTeste,
} from "../src/features/pessoas-admin/mocks/pessoas-admin.handlers";
import { perfilAdmin } from "../src/test/fixtures/pessoas";

import { simularSessao } from "./sessao";

async function abrirPessoas(page: Page, caminho = "/admin/pessoas") {
  await simularSessao(page, perfilAdmin);
  await page.route("**/api/admin/pessoas?**", (rota) =>
    rota.fulfill({ json: filtrarPessoas(pessoasTeste, new URL(rota.request().url())) }),
  );
  await page.goto(caminho);
  await expect(page.getByRole("heading", { name: "Pessoas", level: 1 })).toBeVisible();
  await expect(page.getByText("Página 1 de 2").or(page.getByText("Página 2 de 2"))).toBeVisible();
}

test("o Admin busca, pagina e vê os dados persistidos na URL", async ({ page }, info) => {
  await abrirPessoas(page);

  await page.screenshot({
    path: `test-results/capturas/admin-pessoas-${info.project.name}.png`,
    animations: "disabled",
    fullPage: true,
  });
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual(
    [],
  );

  await page.getByRole("button", { name: "Próxima" }).click();
  await expect(page).toHaveURL(/\?pagina=2$/);
  await expect(page.getByText("Página 2 de 2")).toBeVisible();

  await page.getByRole("searchbox", { name: "Buscar por nome, e-mail ou PMI ID" }).fill("camila");
  await expect(page).toHaveURL(/\?busca=camila$/);
  await expect(page.getByText("Camila Lopes").filter({ visible: true })).toBeVisible();
  await expect(page.getByText("Bruno Tavares").filter({ visible: true })).toHaveCount(0);
  await expect(page.getByText("25", { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("searchbox")).toHaveValue("camila");
  await expect(page.getByText("Camila Lopes").filter({ visible: true })).toBeVisible();
});

test("restaura a busca e a página ao abrir a URL", async ({ page }) => {
  await abrirPessoas(page, "/admin/pessoas?busca=pessoa&pagina=2");

  await expect(page.getByRole("searchbox")).toHaveValue("pessoa");
  await expect(page.getByText("Página 2 de 2")).toBeVisible();
});
