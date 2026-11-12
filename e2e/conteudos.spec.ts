import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import {
  catalogoFiliado,
  catalogoPrevia,
  categoriasTeste,
} from "../src/features/conteudos/mocks/conteudos.handlers";
import type { Catalogo } from "../src/features/conteudos/tipos/conteudo";
import type { Perfil } from "../src/shared/sessao/tipos";
import { perfilFiliado, perfilNaoFiliado } from "../src/test/fixtures/pessoas";

import { simularSessao } from "./sessao";

async function abrir(page: Page, perfil: Perfil, catalogo: Catalogo, rota: string) {
  await simularSessao(page, perfil);
  await page.route("**/api/conteudo-categorias", (r) => r.fulfill({ json: categoriasTeste }));
  await page.route("**/api/conteudos?*", (r) => r.fulfill({ json: catalogo }));
  await page.route("**/api/conteudos", (r) => r.fulfill({ json: catalogo }));
  await page.goto(rota);
}

async function conferirAcessibilidade(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual(
    [],
  );
}

const capturar = (page: Page, nome: string, projeto: string) =>
  page.screenshot({
    path: `test-results/capturas/conteudos-${nome}-${projeto}.png`,
    animations: "disabled",
    fullPage: true,
  });

test("o Filiado vê o resumo e chega à biblioteca filtrada", async ({ page }, info) => {
  await abrir(page, perfilFiliado, catalogoFiliado, "/conteudos");
  await expect(page.getByRole("heading", { level: 2, name: "Assistidos" })).toBeVisible();
  await capturar(page, "resumo-filiado", info.project.name);
  await conferirAcessibilidade(page);
  await expect(page.getByRole("navigation", { name: "Paginação" })).toHaveCount(0);

  await page.getByRole("button", { name: "Vídeos" }).click();
  await expect(page).toHaveURL(/\/conteudos\/biblioteca\?tipo=VIDEO/);
  await expect(page.getByRole("heading", { level: 1, name: "Biblioteca completa" })).toBeVisible();
});

test("o Filiado abre o histórico pelo link", async ({ page }, info) => {
  await abrir(page, perfilFiliado, catalogoFiliado, "/conteudos");

  await page.getByRole("link", { name: "Ver histórico" }).click();
  await expect(page).toHaveURL(/\/conteudos\/historico$/);
  await expect(page.getByRole("heading", { level: 1, name: "Histórico" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3 })).toHaveCount(1);
  await capturar(page, "historico-filiado", info.project.name);
  await conferirAcessibilidade(page);
});

test("a biblioteca do Filiado mostra categorias e filtro", async ({ page }, info) => {
  await abrir(page, perfilFiliado, catalogoFiliado, "/conteudos/biblioteca");
  await expect(page.getByRole("heading", { level: 2, name: "Tecnologia" })).toBeVisible();
  await capturar(page, "biblioteca-filiado", info.project.name);
  await conferirAcessibilidade(page);
});

test("o Não-Filiado vê o título do exclusivo, sem poder abri-lo", async ({ page }, info) => {
  await abrir(page, perfilNaoFiliado, catalogoPrevia, "/conteudos/biblioteca");
  await expect(page.getByRole("heading", { level: 2, name: "Tecnologia" })).toBeVisible();

  await expect(page.getByRole("region", { name: "Exclusivo para filiados" })).toBeVisible();
  await expect(page.locator("[data-bloqueado='true']")).toHaveCount(1);
  await capturar(page, "biblioteca-previa", info.project.name);
  await conferirAcessibilidade(page);

  await expect(
    page.locator("[data-bloqueado='true']").getByRole("heading", { level: 3 }),
  ).toBeVisible();
  await expect(page.locator("[data-bloqueado='true'] :is(a, button)")).toHaveCount(0);
});

test("o resumo do Não-Filiado traz o exclusivo em Adicionados recentemente", async ({
  page,
}, info) => {
  await abrir(page, perfilNaoFiliado, catalogoPrevia, "/conteudos");
  await expect(
    page.getByRole("heading", { level: 2, name: "Adicionados recentemente" }),
  ).toBeVisible();
  await expect(page.locator("[data-bloqueado='true']")).toHaveCount(1);
  await capturar(page, "resumo-previa", info.project.name);
  await conferirAcessibilidade(page);
});
