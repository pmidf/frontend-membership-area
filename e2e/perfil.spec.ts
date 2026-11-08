import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { sessoesTeste } from "../src/features/seguranca/mocks/seguranca.handlers";
import type { Perfil } from "../src/shared/sessao/tipos";
import { perfilFiliado, perfilNaoFiliado } from "../src/test/fixtures/pessoas";

import { simularSessao } from "./sessao";

async function abrirPerfil(page: Page, perfilInicial: Perfil) {
  let perfil = perfilInicial;
  const corpos: unknown[] = [];
  await simularSessao(page, perfil);
  await page.route("**/api/me", (rota) => {
    if (rota.request().method() !== "PATCH") return rota.fulfill({ json: perfil });
    const corpo = rota.request().postDataJSON() as Partial<Perfil>;
    corpos.push(corpo);
    perfil = { ...perfil, ...corpo };
    return rota.fulfill({ json: perfil });
  });
  await page.route("**/api/me/sessoes**", (rota) => rota.fulfill({ json: sessoesTeste }));
  await page.goto("/perfil");
  await expect(page.getByRole("heading", { name: "Dados pessoais" })).toBeVisible();
  return corpos;
}

test("edita os dados pessoais e a mini bio, e os valores continuam depois de recarregar", async ({
  page,
}, info) => {
  const corpos = await abrirPerfil(page, perfilNaoFiliado);

  const salvar = page.getByRole("button", { name: "Salvar alterações" });
  await expect(salvar).toBeDisabled();
  await page.screenshot({
    path: `test-results/capturas/perfil-nao-filiado-${info.project.name}.png`,
    animations: "disabled",
    fullPage: true,
  });

  await page.getByRole("textbox", { name: "Cargo" }).fill("Diretor de Projetos");
  await salvar.click();
  await expect(page.getByText("Dados atualizados.")).toBeVisible();
  expect(corpos).toEqual([{ cargo: "Diretor de Projetos" }]);
  await expect(salvar).toBeDisabled();

  await page.getByRole("button", { name: "Editar mini bio" }).click();
  const modal = page.getByRole("dialog", { name: "Editar mini bio" });
  await modal.getByRole("textbox", { name: "Mini bio" }).fill("Gerente de obras públicas.");
  await modal.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText("Gerente de obras públicas.")).toBeVisible();

  await page.reload();
  await expect(page.getByRole("textbox", { name: "Cargo" })).toHaveValue("Diretor de Projetos");
  await expect(page.getByText("Gerente de obras públicas.")).toBeVisible();
});

test("o Filiado vê o nome bloqueado e a página passa no axe", async ({ page }, info) => {
  await abrirPerfil(page, perfilFiliado);

  await expect(page.getByRole("textbox", { name: "Nome completo" })).not.toBeEditable();
  await expect(page.getByText("Filiado PMI-DF")).toBeVisible();
  await page.screenshot({
    path: `test-results/capturas/perfil-filiado-${info.project.name}.png`,
    animations: "disabled",
    fullPage: true,
  });

  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual(
    [],
  );
});
