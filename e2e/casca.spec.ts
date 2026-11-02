import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import {
  perfilAdmin,
  perfilExpirado,
  perfilFiliado,
  perfilNaoFiliado,
} from "../src/test/fixtures/pessoas";

import { simularSessao } from "./sessao";

async function semViolacoesGraves(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual(
    [],
  );
}

test("o visitante cai na agenda com a casca pública e é levado ao login nas áreas protegidas", async ({
  page,
}, info) => {
  await simularSessao(page, null);
  await page.goto("/");

  await expect(page).toHaveURL(/\/agenda$/);
  await expect(page.getByRole("heading", { name: "Agenda de eventos", level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Entrar" }).first()).toBeVisible();
  await page.screenshot({
    path: `test-results/capturas/casca-visitante-${info.project.name}.png`,
    animations: "disabled",
  });
  await semViolacoesGraves(page);

  await page.goto("/perfil");
  await expect(page).toHaveURL(/\/login\?redirecionar=%2Fperfil$/);
});

test("o Filiado vê o selo e a navegação da área do membro", async ({ page }, info) => {
  await simularSessao(page, perfilFiliado);
  await page.goto("/");

  await expect(page).toHaveURL(/\/inicio$/);
  await expect(page.getByText("Filiado ativo").filter({ visible: true }).first()).toBeVisible();

  if (info.project.name === "desktop") {
    const navegacao = page.getByRole("navigation", { name: "Área do membro" });
    await expect(navegacao.getByRole("link", { name: "Início" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(page.getByText("Filiação válida até 03/2027")).toBeVisible();
    await navegacao.getByRole("link", { name: "Clube de benefícios" }).click();
  } else {
    const navegacao = page.getByRole("navigation", { name: "Navegação principal" });
    await expect(navegacao.getByRole("link")).toHaveCount(5);
    await navegacao.getByRole("link", { name: "Benefícios" }).click();
  }

  await expect(page).toHaveURL(/\/beneficios$/);
  await expect(page.getByRole("heading", { name: "Clube de benefícios", level: 1 })).toBeVisible();
  await expect(page.locator('[aria-current="page"]').filter({ visible: true })).toHaveCount(1);
  await page.screenshot({
    path: `test-results/capturas/casca-filiado-${info.project.name}.png`,
    animations: "disabled",
  });
  await semViolacoesGraves(page);
});

test("o Não-Filiado vê o plano gratuito e sai pelo menu da conta", async ({ page }, info) => {
  await simularSessao(page, perfilNaoFiliado);
  await page.goto("/inicio");

  await expect(page.getByText("Não filiado").filter({ visible: true }).first()).toBeVisible();
  if (info.project.name === "desktop") {
    await expect(page.getByText("Você está no plano gratuito")).toBeVisible();
  }
  await page.screenshot({
    path: `test-results/capturas/casca-nao-filiado-${info.project.name}.png`,
    animations: "disabled",
  });

  await page.getByRole("button", { name: /Rafael Souza/ }).click();
  await page.getByRole("button", { name: "Sair" }).click();

  await expect(page).toHaveURL(/\/login/);
});

test("a filiação vencida mostra o aviso, que pode ser dispensado", async ({ page }) => {
  await simularSessao(page, perfilExpirado);
  await page.goto("/inicio");

  const aviso = page.getByRole("alert").filter({ hasText: "Sua filiação venceu em 30/09." });
  await expect(aviso).toBeVisible();
  await expect(aviso.getByRole("link", { name: "Atualizar minha situação" })).toHaveAttribute(
    "href",
    "/perfil#filiacao",
  );

  await aviso.getByRole("button", { name: "Dispensar aviso" }).click();
  await expect(aviso).toBeHidden();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Início", level: 1 })).toBeVisible();
  await expect(page.getByText("Sua filiação venceu em 30/09.")).toBeHidden();
});

test("o Admin chega ao console pelo menu e vê a navegação administrativa", async ({
  page,
}, info) => {
  await simularSessao(page, perfilAdmin);
  await page.goto("/inicio");

  await page.getByRole("button", { name: /Rafael Lima/ }).click();
  await page.getByRole("link", { name: "Console administrativo" }).last().click();

  await expect(page).toHaveURL(/\/admin\/pessoas$/);
  await expect(page.getByRole("heading", { name: "Pessoas", level: 1 })).toBeVisible();

  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Abrir navegação" }).click();
  }
  const console = page.getByRole("navigation", { name: "Console administrativo" });
  await expect(console.getByRole("link")).toHaveCount(6);
  await expect(page.getByRole("link", { name: "Voltar à área do membro" })).toBeVisible();
  await page.screenshot({
    path: `test-results/capturas/casca-admin-${info.project.name}.png`,
    animations: "disabled",
  });
  await semViolacoesGraves(page);
});
