import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { eventosTeste, situacoesTeste } from "../src/features/agenda/mocks/agenda.handlers";
import {
  filtrarLista,
  historicoTeste,
  itensTeste,
  previaTeste,
} from "../src/features/beneficios/mocks/beneficios.handlers";
import {
  catalogoFiliado,
  catalogoPrevia,
  itemBloqueado,
} from "../src/features/conteudos/mocks/conteudos.handlers";
import { painelTeste } from "../src/features/gamificacao/mocks/gamificacao.handlers";
import type { Perfil } from "../src/shared/sessao/tipos";
import { perfilFiliado, perfilNaoFiliado } from "../src/test/fixtures/pessoas";

import { simularSessao } from "./sessao";

async function abrir(page: Page, perfil: Perfil, { agendaFora = false } = {}) {
  const caminhos: string[] = [];
  page.on("request", (requisicao) => caminhos.push(new URL(requisicao.url()).pathname));
  const filiado = perfil.papeis.filiado;
  const catalogo = filiado ? catalogoFiliado : catalogoPrevia;

  await simularSessao(page, perfil);
  await page.route("**/api/gamificacao", (rota) => rota.fulfill({ json: painelTeste }));
  await page.route("**/api/me/resgates", (rota) => rota.fulfill({ json: historicoTeste }));
  await page.route("**/api/agenda/eventos", (rota) =>
    rota.fulfill(agendaFora ? { status: 502 } : { json: eventosTeste }),
  );
  await page.route("**/api/agenda/participacoes/situacao", (rota) =>
    rota.fulfill({ json: situacoesTeste }),
  );
  await page.route(/\/api\/beneficios(\?.*)?$/, (rota) =>
    rota.fulfill({
      json: filiado ? filtrarLista(itensTeste, new URL(rota.request().url())) : previaTeste,
    }),
  );
  await page.route(/\/api\/conteudos(\?.*)?$/, (rota) => rota.fulfill({ json: catalogo }));
  await page.route("**/api/trilhas", (rota) => rota.fulfill({ json: [] }));
  await page.goto("/inicio");
  return caminhos;
}

async function conferirAcessibilidade(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual(
    [],
  );
}

const capturar = (page: Page, nome: string, projeto: string) =>
  page.screenshot({
    path: `test-results/capturas/inicio-${nome}-${projeto}.png`,
    animations: "disabled",
    fullPage: true,
  });

const secao = (page: Page, nome: string) => page.getByRole("region", { name: nome });

async function esperarSecoes(page: Page, nomes: string[]) {
  for (const nome of nomes) {
    await expect(secao(page, nome)).toBeVisible();
    await expect(secao(page, nome).getByRole("status")).toHaveCount(0);
  }
}

test("o Filiado vê saudação, indicadores e as três seções", async ({ page }, info) => {
  const caminhos = await abrir(page, perfilFiliado);

  await expect(page.getByRole("heading", { level: 1, name: "Olá, Maria" })).toBeVisible();
  await expect(page.getByText("Sua filiação ao PMI-DF é válida até 03/2027.")).toBeVisible();
  const indicadores = page.getByRole("list", { name: "Seus números no capítulo" });
  await expect(indicadores.getByRole("listitem")).toHaveText([
    /^1\s*Eventos em que você esteve presente/,
    /^3\s*Quebra-cabeças completos/,
    /^3\s*Benefícios resgatados/,
  ]);
  await esperarSecoes(page, [
    "Próximos eventos",
    "Vantagens do momento",
    "Conteúdo exclusivo recente",
  ]);
  await expect(secao(page, "Próximos eventos").getByRole("heading", { level: 3 })).toHaveText([
    "Webinar de Agilidade",
    "Encontro de Gestão de Projetos",
    "Summit do capítulo",
  ]);
  await expect(secao(page, "Próximos eventos").getByText(/ · Presencial · Brasília$/)).toHaveCount(
    2,
  );
  await expect(secao(page, "Vantagens do momento").getByRole("heading", { level: 3 })).toHaveCount(
    3,
  );
  await expect(
    secao(page, "Conteúdo exclusivo recente").getByRole("heading", { level: 3 }),
  ).toHaveCount(3);
  expect(caminhos).toContain("/api/gamificacao");

  await capturar(page, "filiado", info.project.name);
  await conferirAcessibilidade(page);
});

test("o Não-Filiado vê a faixa e as prévias, sem consultar a gamificação", async ({
  page,
}, info) => {
  const caminhos = await abrir(page, perfilNaoFiliado);

  const faixa = secao(page, "Você está vendo a versão gratuita");
  await expect(faixa.getByRole("link", { name: /Quero me filiar/ })).toBeVisible();
  await expect(page.getByRole("main").getByRole("link", { name: "Meu perfil" })).toHaveAttribute(
    "href",
    "/perfil#filiacao",
  );
  await esperarSecoes(page, [
    "Próximos eventos",
    "Vantagens que a filiação libera",
    "Conteúdo exclusivo",
  ]);
  await expect(
    secao(page, "Vantagens que a filiação libera").locator("[data-bloqueado='true']"),
  ).toHaveCount(3);
  await expect(secao(page, "Conteúdo exclusivo").getByRole("heading", { level: 3 })).toHaveText([
    itemBloqueado.titulo,
  ]);
  await expect(page.getByRole("list", { name: "Seus números no capítulo" })).toHaveCount(0);

  await capturar(page, "nao-filiado", info.project.name);
  await conferirAcessibilidade(page);
  expect(caminhos.filter((caminho) => caminho.startsWith("/api/gamificacao"))).toEqual([]);
  expect(caminhos).not.toContain("/api/agenda/participacoes/situacao");
});

test("a agenda fora do ar fica restrita à seção de eventos", async ({ page }, info) => {
  await abrir(page, perfilFiliado, { agendaFora: true });

  await expect(secao(page, "Próximos eventos").getByRole("alert")).toContainText(
    "A agenda está indisponível no momento.",
    { timeout: 15_000 },
  );
  await esperarSecoes(page, ["Vantagens do momento", "Conteúdo exclusivo recente"]);
  await expect(secao(page, "Vantagens do momento").getByRole("heading", { level: 3 })).toHaveCount(
    3,
  );
  await capturar(page, "agenda-fora", info.project.name);
});

test("Ver clube de benefícios abre com os dados já carregados", async ({ page }) => {
  const caminhos = await abrir(page, perfilFiliado);
  await esperarSecoes(page, ["Vantagens do momento"]);
  const consultasAntes = caminhos.filter((caminho) => caminho === "/api/beneficios").length;

  await page.getByRole("link", { name: "Ver clube de benefícios" }).click();

  await expect(page).toHaveURL(/\/beneficios$/);
  await expect(page.getByRole("link", { name: itensTeste[0].titulo })).toBeVisible();
  expect(caminhos.filter((caminho) => caminho === "/api/beneficios")).toHaveLength(consultasAntes);
});

test("no mobile os destaques viram carrossel e os indicadores ficam em uma coluna", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "mobile", "Layout específico do mobile");
  await abrir(page, perfilFiliado);
  await esperarSecoes(page, ["Vantagens do momento"]);

  const trilho = secao(page, "Vantagens do momento").locator("[data-trilho]");
  await expect(trilho).toHaveCSS("scroll-snap-type", "x mandatory");
  const larguras = await trilho.evaluate((elemento) => ({
    visivel: elemento.clientWidth,
    total: elemento.scrollWidth,
  }));
  expect(larguras.total).toBeGreaterThan(larguras.visivel);

  const indicadores = page.getByRole("list", { name: "Seus números no capítulo" });
  const posicoes = await indicadores
    .getByRole("listitem")
    .evaluateAll((itens) => itens.map((item) => item.getBoundingClientRect().left));
  expect(new Set(posicoes).size).toBe(1);
  const larguraPagina = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(larguraPagina).toBeLessThanOrEqual(390);
});
