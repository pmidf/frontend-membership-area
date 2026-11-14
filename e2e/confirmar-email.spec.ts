import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { perfilFiliado } from "../src/test/fixtures/pessoas";

async function semViolacoesGraves(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual(
    [],
  );
}

test("confirma o e-mail colando o código e entra como Filiado", async ({ page }, info) => {
  let confirmou = false;
  await page.route("**/api/auth/refresh", (rota) =>
    confirmou
      ? rota.fulfill({ json: { access_token: "token-e2e", expira_em_segundos: 900 } })
      : rota.fulfill({ status: 401, json: { codigo: "SESSAO_INVALIDA" } }),
  );
  await page.route("**/api/me", (rota) => rota.fulfill({ json: perfilFiliado }));
  await page.route("**/api/auth/confirmar-email", (rota) => {
    confirmou = true;
    return rota.fulfill({
      json: {
        access_token: "token-e2e",
        expira_em_segundos: 900,
        filiacao: { situacao: "APROVADO", resultado: "APROVADO" },
      },
    });
  });

  await page.goto("/confirmar-email?email=filiado%40teste.pmidf.org.br");
  await expect(page.getByRole("heading", { name: "Confirme seu e-mail" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Dígito 1 de 6" })).toBeFocused();
  await expect(
    page.getByRole("button", { name: /Reenviar código \(disponível em [12]:\d\d\)/ }),
  ).toBeDisabled();
  await page.screenshot({
    path: `test-results/capturas/confirmar-email-${info.project.name}.png`,
    animations: "disabled",
  });
  await semViolacoesGraves(page);

  await page.evaluate(async () => {
    const dados = new DataTransfer();
    dados.setData("text/plain", "123456");
    document.activeElement?.dispatchEvent(
      new ClipboardEvent("paste", { clipboardData: dados, bubbles: true, cancelable: true }),
    );
  });

  await expect(page.getByRole("heading", { name: "Filiação confirmada" })).toBeVisible();
  await expect(page.getByText("Bem-vinda, Maria!")).toBeVisible();
  await page.screenshot({
    path: `test-results/capturas/filiacao-confirmada-${info.project.name}.png`,
    animations: "disabled",
  });
  await semViolacoesGraves(page);

  await page.getByRole("link", { name: "Entrar na plataforma" }).click();
  await expect(page).toHaveURL(/\/inicio$/);
  await expect(page.getByText("Filiado ativo").filter({ visible: true }).first()).toBeVisible();
});

test("mostra o resultado não localizado com o caminho para o perfil", async ({ page }, info) => {
  await page.route("**/api/auth/refresh", (rota) =>
    rota.fulfill({ status: 401, json: { codigo: "SESSAO_INVALIDA" } }),
  );
  await page.route("**/api/me", (rota) => rota.fulfill({ status: 401 }));
  await page.route("**/api/auth/confirmar-email", (rota) =>
    rota.fulfill({
      json: {
        access_token: "token-e2e",
        expira_em_segundos: 900,
        filiacao: { situacao: "PENDENTE", resultado: "NAO_LOCALIZADO" },
      },
    }),
  );

  await page.goto("/confirmar-email?email=pendente%40teste.pmidf.org.br&origem=login");
  await expect(page.getByText("Confirme seu e-mail para entrar.")).toBeVisible();
  for (const [indice, digito] of [..."123456"].entries()) {
    await page.getByRole("textbox", { name: `Dígito ${indice + 1} de 6` }).fill(digito);
  }

  await expect(page.getByRole("heading", { name: "Conta criada" })).toBeVisible();
  await expect(page.getByText("Não localizamos sua filiação na base do PMI.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Meu perfil" })).toHaveAttribute(
    "href",
    "/perfil#filiacao",
  );
  await page.screenshot({
    path: `test-results/capturas/conta-criada-nao-localizado-${info.project.name}.png`,
    animations: "disabled",
  });
});
