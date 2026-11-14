import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { sessoesTeste } from "../src/features/seguranca/mocks/seguranca.handlers";
import { perfilFiliado } from "../src/test/fixtures/pessoas";

import { simularSessao } from "./sessao";

test("encerra outra sessão e troca a senha na seção Segurança", async ({ page }, info) => {
  let sessoes = [...sessoesTeste];
  await simularSessao(page, perfilFiliado);
  await page.route("**/api/me/sessoes**", (rota) => {
    const requisicao = rota.request();
    if (requisicao.method() === "GET") return rota.fulfill({ json: sessoes });
    sessoes = sessoes.filter((sessao) => sessao.atual);
    return rota.fulfill({ status: 204 });
  });
  await page.route("**/api/me/senha", (rota) => rota.fulfill({ status: 204 }));

  await page.goto("/perfil#seguranca");
  const secao = page.getByRole("region", { name: "Segurança" });
  await expect(secao.getByText("Chrome no Android", { exact: true })).toBeVisible();
  await expect(secao.getByText("Esta sessão")).toBeVisible();
  await secao.screenshot({
    path: `test-results/capturas/seguranca-${info.project.name}.png`,
    animations: "disabled",
  });
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual(
    [],
  );

  await secao.getByRole("button", { name: "Encerrar a sessão Chrome no Android" }).click();
  await page
    .getByRole("dialog", { name: "Encerrar sessão?" })
    .getByRole("button", { name: "Encerrar" })
    .click();
  await expect(secao.getByText("Chrome no Android", { exact: true })).toBeHidden();
  await expect(
    secao.getByRole("button", { name: "Encerrar todas as outras sessões" }),
  ).toBeDisabled();

  await secao.getByRole("button", { name: "Trocar senha" }).click();
  const modal = page.getByRole("dialog", { name: "Trocar senha" });
  await modal.getByLabel("Senha atual", { exact: true }).fill("SenhaAtual2026!");
  await modal.getByLabel("Nova senha", { exact: true }).fill("NovaSenha2026!");
  await modal.getByLabel("Confirmar nova senha", { exact: true }).fill("NovaSenha2026!");
  await page.screenshot({
    path: `test-results/capturas/trocar-senha-${info.project.name}.png`,
    animations: "disabled",
  });
  await modal.getByRole("button", { name: "Salvar" }).click();

  await expect(modal).toBeHidden();
  await expect(page.getByText("Senha alterada. As outras sessões foram encerradas.")).toBeVisible();
});
