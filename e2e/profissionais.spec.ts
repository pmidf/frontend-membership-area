import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { camila, itensTeste } from "../src/features/profissionais/mocks/profissionais.handlers";
import type { Perfil } from "../src/shared/sessao/tipos";
import { perfilFiliado, perfilNaoFiliado } from "../src/test/fixtures/pessoas";

import { simularSessao } from "./sessao";

const listaTeste = {
  total: itensTeste.length,
  pagina: 1,
  total_paginas: 2,
  itens: itensTeste.slice(0, 20),
};

async function semViolacoesSerias(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual(
    [],
  );
}

async function abrirLista(page: Page, perfil: Perfil) {
  await simularSessao(page, perfil);
  await page.route("**/api/profissionais*", (rota) => rota.fulfill({ json: listaTeste }));
  await page.goto("/profissionais");
  await expect(page.getByRole("list", { name: "Profissionais da comunidade" })).toBeVisible();
}

test("o Filiado abre a vitrine e vê o convite para aparecer nela", async ({ page }, info) => {
  await abrirLista(page, perfilFiliado);

  await expect(
    page.getByRole("heading", { name: `${itensTeste.length} profissionais` }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Ir para Meu perfil > Preferências" })).toBeVisible();
  await page.screenshot({
    path: `test-results/capturas/profissionais-filiado-${info.project.name}.png`,
    animations: "disabled",
    fullPage: true,
  });
  await semViolacoesSerias(page);
});

test("o Não-Filiado vê a vitrine com a nota de que só filiados se apresentam", async ({
  page,
}, info) => {
  await abrirLista(page, perfilNaoFiliado);

  await expect(page.getByText("Apenas filiados podem se apresentar aqui.")).toBeVisible();
  await page.screenshot({
    path: `test-results/capturas/profissionais-nao-filiado-${info.project.name}.png`,
    animations: "disabled",
    fullPage: true,
  });
  await semViolacoesSerias(page);
});

test("o perfil mostra a mini bio e o LinkedIn", async ({ page }, info) => {
  await simularSessao(page, perfilFiliado);
  await page.route("**/api/profissionais/*", (rota) => rota.fulfill({ json: camila }));

  await page.goto(`/profissionais/${camila.id_pessoa}`);

  await expect(page.getByRole("heading", { level: 2, name: camila.nome_completo })).toBeVisible();
  await expect(page.getByRole("link", { name: /Ver no LinkedIn/ })).toBeVisible();
  await page.screenshot({
    path: `test-results/capturas/profissional-perfil-${info.project.name}.png`,
    animations: "disabled",
    fullPage: true,
  });
  await semViolacoesSerias(page);
});
