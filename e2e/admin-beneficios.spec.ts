import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import type { BeneficioAdmin } from "../src/features/beneficios-admin/api/beneficios-admin.api";
import {
  beneficioAdminTeste,
  beneficiosAdminTeste,
  filtrarBeneficiosAdmin,
  ID_BENEFICIO_CRIADO,
  parceirosTeste,
  relatorioResgatesTeste,
} from "../src/features/beneficios-admin/mocks/beneficios-admin.handlers";
import { perfilAdmin } from "../src/test/fixtures/pessoas";

import { simularSessao } from "./sessao";

async function simularRelatorio(page: Page) {
  const consultas: string[] = [];
  await page.route("**/api/admin/beneficios/relatorio*", (rota) => {
    const url = new URL(rota.request().url());
    const ano = Number(url.searchParams.get("ano"));
    consultas.push(`${url.pathname}${url.search}`);
    if (url.pathname.endsWith(".csv"))
      return rota.fulfill({
        body: "data do resgate;benefício\n05/11/2026, 11:20;Voucher",
        contentType: "text/csv",
        headers: { "Content-Disposition": `attachment; filename="relatorio-resgates-${ano}.csv"` },
      });
    return rota.fulfill({ json: relatorioResgatesTeste(ano) });
  });
  return consultas;
}

async function abrir(page: Page, caminho = "/admin/beneficios") {
  await simularSessao(page, perfilAdmin);
  await page.route("**/api/admin/beneficios*", (rota) =>
    rota.fulfill({
      json: filtrarBeneficiosAdmin(beneficiosAdminTeste, new URL(rota.request().url())),
    }),
  );
  await simularRelatorio(page);
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
  await simularRelatorio(page);
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
    page.getByRole("button", { name: "Exportar CSV", exact: true }).click(),
  ]);

  expect(download.suggestedFilename()).toBe("beneficios-2026-11-09.csv");
  expect(consulta).toBe("?situacao=PUBLICADO");
  await expect(page.getByText("CSV exportado")).toBeVisible();
});

test("o Admin acompanha o relatório de resgates e exporta o CSV do ano (US-04.08)", async ({
  page,
}, info) => {
  await simularSessao(page, perfilAdmin);
  await page.route("**/api/admin/beneficios*", (rota) =>
    rota.fulfill({
      json: filtrarBeneficiosAdmin(beneficiosAdminTeste, new URL(rota.request().url())),
    }),
  );
  const consultas = await simularRelatorio(page);
  await page.goto("/admin/beneficios");

  const secao = page.getByRole("region", { name: "Relatório de resgates" });
  const ano = Number(await secao.getByRole("combobox", { name: "Ano" }).inputValue());
  const atual = relatorioResgatesTeste(ano);
  await expect(page.getByText(`Resgates em ${ano}`, { exact: true })).toBeVisible();
  await expect(secao.getByText("Taxa de utilização sobre a base ativa")).toBeVisible();
  const porBeneficio = (doAno: number) => secao.getByLabel(`Resgates por benefício em ${doAno}`);
  await expect(porBeneficio(ano)).toContainText(atual.por_beneficio[0].titulo);
  await expect(porBeneficio(ano)).toContainText(String(atual.por_beneficio[0].resgates));
  await secao.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `test-results/capturas/admin-beneficios-relatorio-${info.project.name}.png`,
    animations: "disabled",
    fullPage: true,
  });
  const { violations } = await new AxeBuilder({ page }).include("main").analyze();
  expect(violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual(
    [],
  );

  await secao.getByRole("combobox", { name: "Ano" }).selectOption(String(ano - 1));
  const anterior = relatorioResgatesTeste(ano - 1);
  await expect(porBeneficio(ano - 1)).toContainText(String(anterior.por_beneficio[0].resgates));

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    secao.getByRole("button", { name: /^Exportar CSV/ }).click(),
  ]);

  expect(download.suggestedFilename()).toBe(`relatorio-resgates-${ano - 1}.csv`);
  expect(consultas).toContain(`/api/admin/beneficios/relatorio.csv?ano=${ano - 1}`);
  await expect(page.getByText("Relatório exportado")).toBeVisible();
});

test("o botão Novo benefício leva ao cadastro", async ({ page }) => {
  await abrir(page);
  await page.route("**/api/admin/parceiros", (rota) => rota.fulfill({ json: parceirosTeste }));

  await page.getByRole("link", { name: "Novo benefício" }).click();

  await expect(page).toHaveURL(/\/admin\/beneficios\/novo$/);
  await expect(page.getByRole("heading", { name: "Novo benefício", level: 1 })).toBeVisible();
});

test("o Admin cria e publica um benefício", async ({ page }, info) => {
  const caminhos: string[] = [];
  let criacao: Record<string, unknown> = {};
  await simularSessao(page, perfilAdmin);
  await page.route("**/api/admin/parceiros", (rota) => rota.fulfill({ json: parceirosTeste }));
  await page.route("**/api/admin/beneficios*", (rota) => {
    if (rota.request().method() !== "POST") {
      return rota.fulfill({
        json: filtrarBeneficiosAdmin(beneficiosAdminTeste, new URL(rota.request().url())),
      });
    }
    caminhos.push(new URL(rota.request().url()).pathname);
    criacao = rota.request().postDataJSON() as Record<string, unknown>;
    return rota.fulfill({
      status: 201,
      json: { ...beneficioAdminTeste, ...criacao, id_beneficio: ID_BENEFICIO_CRIADO },
    });
  });
  await page.route("**/api/admin/beneficios/*/publicar", (rota) => {
    caminhos.push(new URL(rota.request().url()).pathname);
    return rota.fulfill({ json: { ...beneficioAdminTeste, situacao: "PUBLICADO" } });
  });

  await page.goto("/admin/beneficios/novo");
  const parceiro = page.getByRole("combobox", { name: "Parceiro" });
  await expect(parceiro.getByRole("option", { name: "Brisk Educação" })).toBeAttached();
  await page.screenshot({
    path: `test-results/capturas/admin-beneficio-novo-${info.project.name}.png`,
    animations: "disabled",
    fullPage: true,
  });
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual(
    [],
  );

  await page.getByRole("textbox", { name: "Título da vantagem" }).fill("30% no curso PMP");
  await page.getByRole("textbox", { name: "Legenda curta" }).fill("Desconto na preparação");
  await page.getByRole("textbox", { name: "Descrição completa" }).fill("Turmas online.");
  await parceiro.selectOption({ label: "Brisk Educação" });
  await page.getByRole("textbox", { name: "URL da imagem" }).fill("https://exemplo.test/pmp.png");
  await page.getByRole("textbox", { name: "Código do cupom" }).fill("PMP30");
  await page.getByLabel("Início da vigência").fill("2026-12-01");
  await page.getByRole("button", { name: "Publicar benefício" }).click();

  await expect(page.getByText("Benefício publicado")).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/beneficios$/);
  expect(caminhos).toEqual([
    "/api/admin/beneficios",
    `/api/admin/beneficios/${ID_BENEFICIO_CRIADO}/publicar`,
  ]);
  expect(criacao).toMatchObject({
    cod_parceiro: parceirosTeste[1].cod_parceiro,
    cod_cupom: "PMP30",
  });
});

test("o Admin edita, publica, arquiva e duplica um benefício", async ({ page }, info) => {
  let beneficio: BeneficioAdmin = beneficioAdminTeste;
  const novoId = "40000000-0000-4000-8000-000000000099";
  const corpos: unknown[] = [];
  await simularSessao(page, perfilAdmin);
  await page.route(`**/api/admin/beneficios/*`, (rota) => {
    if (rota.request().method() === "PATCH") {
      const corpo = rota.request().postDataJSON() as Partial<BeneficioAdmin>;
      corpos.push(corpo);
      beneficio = { ...beneficio, ...corpo };
    }
    return rota.fulfill({ json: beneficio });
  });
  for (const [acao, situacao] of [
    ["publicar", "PUBLICADO"],
    ["arquivar", "ARQUIVADO"],
  ] as const) {
    await page.route(`**/api/admin/beneficios/*/${acao}`, (rota) => {
      beneficio = { ...beneficio, situacao };
      return rota.fulfill({ json: beneficio });
    });
  }
  await page.route("**/api/admin/beneficios/*/duplicar", (rota) => {
    beneficio = { ...beneficio, id_beneficio: novoId, situacao: "RASCUNHO" };
    return rota.fulfill({ status: 201, json: beneficio });
  });

  await page.goto(`/admin/beneficios/${beneficioAdminTeste.id_beneficio}`);
  const titulo = page.getByRole("textbox", { name: "Título da vantagem" });
  await expect(titulo).toHaveValue(beneficioAdminTeste.titulo);
  await page.screenshot({
    path: `test-results/capturas/admin-beneficio-editar-${info.project.name}.png`,
    animations: "disabled",
    fullPage: true,
  });
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual(
    [],
  );

  await titulo.fill("Voucher editado");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page.getByText("Alterações salvas.")).toBeVisible();
  expect(corpos).toEqual([{ titulo: "Voucher editado" }]);

  await page.getByRole("button", { name: "Publicar benefício" }).click();
  await expect(page.getByRole("button", { name: "Despublicar" })).toBeVisible();

  await page.getByRole("button", { name: "Arquivar", exact: true }).click();
  await page
    .getByRole("dialog", { name: "Arquivar benefício?" })
    .getByRole("button", { name: "Arquivar" })
    .click();
  await expect(titulo).toBeDisabled();

  await page.getByRole("button", { name: "Duplicar como rascunho" }).click();
  await expect(page).toHaveURL(new RegExp(`/admin/beneficios/${novoId}$`));
  await expect(page.getByRole("button", { name: "Publicar benefício" })).toBeVisible();
});

test("um id inexistente mostra benefício não encontrado", async ({ page }) => {
  await simularSessao(page, perfilAdmin);
  await page.route("**/api/admin/beneficios/inexistente", (rota) =>
    rota.fulfill({ status: 404, json: {} }),
  );

  await page.goto("/admin/beneficios/inexistente");

  await expect(page.getByText("Benefício não encontrado")).toBeVisible();
});
