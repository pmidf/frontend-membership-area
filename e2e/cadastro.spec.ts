import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type TestInfo } from "@playwright/test";

import { simularSessao } from "./sessao";

async function registrarPasso(page: Page, info: TestInfo, nome: string) {
  await page.screenshot({
    path: `test-results/capturas/cadastro-${nome}-${info.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual(
    [],
  );
}

test("cadastro de filiado em 4 passos até a confirmação do e-mail", async ({ page }, info) => {
  const corpos: unknown[] = [];
  await simularSessao(page, null);
  await page.route("**/api/auth/pre-cadastro", (rota) =>
    rota.fulfill({ json: { filiado: true, dados: { nome_completo: "Filiada Ativa de Teste" } } }),
  );
  await page.route("**/api/auth/cadastro", (rota) => {
    corpos.push(rota.request().postDataJSON());
    return rota.fulfill({
      status: 201,
      json: { mensagem: "Enviamos um código de confirmação para o seu e-mail." },
    });
  });
  await page.route("https://viacep.com.br/ws/**", (rota) =>
    rota.fulfill({
      json: { logradouro: "SBS Quadra 2", bairro: "Asa Sul", localidade: "Brasília", uf: "DF" },
    }),
  );

  await page.goto("/cadastro");
  await expect(page.getByText("Passo 1 de 4 · Dados de acesso")).toBeVisible();
  await page.getByLabel("Nome completo").fill("Maria Souza");
  await page.getByText("Sim", { exact: true }).click();
  await page.getByLabel("PMI ID").fill("1000001");
  await page.getByLabel("E-mail").fill("filiado@teste.pmidf.org.br");
  await page.getByLabel("Senha", { exact: true }).fill("SenhaForte2026!");
  await page.getByRole("checkbox", { name: /Li e aceito/ }).check();
  await registrarPasso(page, info, "1-acesso");
  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(page.getByRole("heading", { name: "Sobre você", level: 1 })).toBeFocused();
  await expect(page.getByText("Encontramos sua filiação no PMI-DF.")).toBeVisible();
  await page.getByLabel("Telefone").fill("61991234567");
  await page.getByLabel("Data de nascimento").fill("1990-05-12");
  await page.getByLabel("Gênero").selectOption("FEMININO");
  await page.getByLabel("Escolaridade").selectOption("MESTRADO");
  await registrarPasso(page, info, "2-pessoal");
  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(page.getByRole("heading", { name: "Onde você mora", level: 1 })).toBeVisible();
  await page.getByLabel("CEP").fill("70040010");
  await page.getByLabel("CEP").blur();
  await expect(page.getByLabel("Número")).toBeFocused();
  await page.getByLabel("Número").fill("10");
  await registrarPasso(page, info, "3-endereco");
  await page.getByRole("button", { name: "Continuar" }).click();

  await expect(page.getByRole("heading", { name: "Sua atuação", level: 1 })).toBeVisible();
  await page.getByLabel("Empresa onde trabalha").fill("Construtora Vega");
  await page.getByLabel("Cargo").fill("Gerente de Projetos");
  await registrarPasso(page, info, "4-profissional");
  await page.getByRole("button", { name: "Criar conta" }).click();

  await expect(page).toHaveURL(/\/confirmar-email\?email=filiado%40teste\.pmidf\.org\.br$/);
  expect(corpos).toEqual([
    expect.objectContaining({
      nome_completo: "Filiada Ativa de Teste",
      pmi_id: "1000001",
      telefone: "61991234567",
      cep: "70040010",
      uf: "DF",
    }),
  ]);
});
