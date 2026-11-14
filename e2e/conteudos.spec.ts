import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import {
  catalogoFiliado,
  catalogoPrevia,
  categoriasTeste,
  detalheMaterial,
  detalheVideo,
  playerTeste,
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

test("o Filiado abre um vídeo, assiste e marca como assistido", async ({ page }, info) => {
  await simularSessao(page, perfilFiliado);
  await page.route(/youtube-nocookie\.com/, (r) =>
    r.fulfill({ contentType: "text/html", body: "<!doctype html><title>Vídeo</title>" }),
  );
  let consumido = false;
  await page.route(`**/api/conteudos/${detalheVideo.id_conteudo}`, (r) =>
    r.fulfill({ json: { ...detalheVideo, consumido } }),
  );
  await page.route(`**/api/conteudos/${detalheVideo.id_conteudo}/player`, (r) =>
    r.fulfill({ json: playerTeste }),
  );
  await page.route(`**/api/conteudos/${detalheVideo.id_conteudo}/consumido`, (r) => {
    consumido = r.request().method() === "PUT";
    return r.fulfill({ status: 204 });
  });

  await page.goto(`/conteudos/${detalheVideo.id_conteudo}?de=%2Fconteudos%2Fhistorico`);
  await expect(page.getByTitle(detalheVideo.titulo)).toBeVisible();
  await capturar(page, "detalhe-video", info.project.name);
  await conferirAcessibilidade(page);
  await expect(page.getByRole("link", { name: /Voltar para o catálogo/ })).toHaveAttribute(
    "href",
    "/conteudos/historico",
  );

  await page.getByRole("button", { name: "Marcar como assistido" }).click();
  await expect(page.getByRole("button", { name: "Assistido — desmarcar" })).toBeVisible();
});

test("o material abre em nova aba", async ({ page, context }, info) => {
  await simularSessao(page, perfilFiliado);
  await context.route("https://exemplo.test/**", (r) =>
    r.fulfill({ contentType: "text/html", body: "<!doctype html><title>Material</title>" }),
  );
  await page.route(`**/api/conteudos/${detalheMaterial.id_conteudo}`, (r) =>
    r.fulfill({ json: detalheMaterial }),
  );
  await page.route(`**/api/conteudos/${detalheMaterial.id_conteudo}/acessos`, (r) =>
    r.fulfill({ status: 201, json: { url: "https://exemplo.test/material.pdf" } }),
  );

  await page.goto(`/conteudos/${detalheMaterial.id_conteudo}`);
  await expect(page.getByRole("heading", { level: 1, name: detalheMaterial.titulo })).toBeVisible();
  await capturar(page, "detalhe-material", info.project.name);
  await conferirAcessibilidade(page);

  const novaAba = context.waitForEvent("page");
  await page.getByRole("button", { name: "Abrir material" }).click();
  const aba = await novaAba;
  await aba.waitForURL("https://exemplo.test/material.pdf");
});
