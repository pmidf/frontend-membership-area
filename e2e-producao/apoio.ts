import { expect, test, type Locator, type Page } from "@playwright/test";

type Credenciais = { email: string; senha: string };

const PAUSA_ENTRE_PASSOS_MS = Number(process.env.E2E_PAUSA_MS ?? 2000);

export async function passo(page: Page, titulo: string, corpo: () => Promise<void>) {
  await test.step(titulo, corpo);
  await page.waitForTimeout(PAUSA_ENTRE_PASSOS_MS);
}

export function exigirCredenciais(prefixo: string): Credenciais {
  const email = process.env[`${prefixo}_EMAIL`];
  const senha = process.env[`${prefixo}_SENHA`];
  const motivo = `defina ${prefixo}_EMAIL e ${prefixo}_SENHA para rodar`;
  test.skip(!email || !senha, motivo);
  if (!email || !senha) throw new Error(motivo);
  return { email, senha };
}

export function semDados(motivo: string) {
  test.info().annotations.push({ type: "sem dados em produção", description: motivo });
}

export async function aguardarCarregamento(page: Page) {
  await expect(page.locator('[role="status"][aria-busy="true"]:visible')).toHaveCount(0);
}

export async function aguardarCaminho(page: Page, caminho: string | RegExp) {
  await page.waitForURL((url) =>
    typeof caminho === "string" ? url.pathname === caminho : caminho.test(url.pathname),
  );
}

export function tituloDaPagina(page: Page, nome?: string) {
  return page.getByRole("heading", { level: 1, ...(nome ? { name: nome, exact: true } : {}) });
}

export async function abrirMenuDaConta(page: Page) {
  const botao = page
    .locator('xpath=//button[@aria-controls][.//span[starts-with(normalize-space(.), "Menu de ")]]')
    .filter({ visible: true });
  await botao.click();
  const idMenu = await botao.getAttribute("aria-controls");
  const menu = page.locator(`[id="${idMenu}"]`);
  await expect(menu).toBeVisible();
  return menu;
}

export async function entrar(page: Page, { email, senha }: Credenciais) {
  await page.goto("/login");
  await expect(tituloDaPagina(page, "Bem-vindo de volta")).toBeVisible();
  await page.getByLabel("E-mail").filter({ visible: true }).fill(email);
  await page.getByLabel("Senha", { exact: true }).filter({ visible: true }).fill(senha);
  await page.getByRole("button", { name: "Entrar" }).click();
  await aguardarCaminho(page, "/inicio");
  await expect(page.getByRole("heading", { level: 1, name: /^Olá, / })).toBeVisible();
}

export async function sairEConferirBloqueio(page: Page, caminhoProtegido: string) {
  const menu = await abrirMenuDaConta(page);
  await menu.getByRole("button", { name: "Sair" }).click();
  await aguardarCaminho(page, "/login");

  await page.goto(caminhoProtegido);
  await page.waitForURL(
    (url) => url.pathname === "/login" && url.searchParams.get("redirecionar") === caminhoProtegido,
  );
}

export async function irPeloMenu(page: Page, rotulo: string, caminho: string, titulo: string) {
  await page
    .getByRole("navigation", { name: "Área do membro" })
    .getByRole("link", { name: rotulo, exact: true })
    .click();
  await aguardarCaminho(page, caminho);
  await expect(tituloDaPagina(page, titulo)).toBeVisible();
}

export async function textoDe(elemento: Locator) {
  return ((await elemento.textContent()) ?? "").trim();
}

export async function abrirEventoEmDestaque(page: Page) {
  await irPeloMenu(page, "Agenda de eventos", "/agenda", "Agenda de eventos");
  const destaque = page.locator('article h2 a[href^="/agenda/"]:visible').first();
  const titulo = await textoDe(destaque);
  await destaque.click();
  await aguardarCaminho(page, /^\/agenda\/[^/]+$/);
  await expect(page.locator("#titulo-evento:visible")).toHaveText(titulo);
}

export async function voltarParaAgenda(page: Page) {
  await page.getByRole("link", { name: "‹ Voltar para a agenda" }).click();
  await aguardarCaminho(page, "/agenda");
}

export async function abrirPrimeiraTrilha(page: Page) {
  await page.goto("/conteudos/trilhas");
  await expect(tituloDaPagina(page, "Trilhas")).toBeVisible();
  await aguardarCarregamento(page);
  const trilhas = page.locator('h3 a[href^="/conteudos/trilhas/"]:visible');
  if ((await trilhas.count()) === 0) {
    semDados("nenhuma trilha publicada");
    return null;
  }
  const titulo = await textoDe(trilhas.first());
  await trilhas.first().click();
  await aguardarCaminho(page, /^\/conteudos\/trilhas\/[^/]+$/);
  await expect(tituloDaPagina(page, titulo)).toBeVisible();
  const itens = page
    .getByRole("list", { name: "Conteúdos na ordem da trilha" })
    .locator(":scope > li");
  await expect(itens.first()).toBeVisible();
  return itens;
}

export async function abrirPrimeiroConteudoComLink(page: Page) {
  await page.goto("/conteudos/biblioteca");
  await expect(tituloDaPagina(page, "Biblioteca completa")).toBeVisible();
  await aguardarCarregamento(page);
  const conteudos = page.locator(
    'h3 a[href^="/conteudos/"]:not([href^="/conteudos/trilhas"]):visible',
  );
  if ((await conteudos.count()) === 0) return false;
  const titulo = await textoDe(conteudos.first());
  await conteudos.first().click();
  await aguardarCaminho(page, /^\/conteudos\/[^/]+$/);
  await expect(tituloDaPagina(page, titulo)).toBeVisible();
  await expect(page.getByRole("link", { name: "‹ Voltar para o catálogo" })).toBeVisible();
  return true;
}

export async function abrirPrimeiroProfissional(page: Page) {
  await page.goto("/profissionais");
  await expect(tituloDaPagina(page, "Profissionais da comunidade")).toBeVisible();
  await aguardarCarregamento(page);
  const perfis = page.getByRole("link", { name: /^Ver perfil de / });
  if ((await perfis.count()) === 0) {
    semDados("nenhum profissional na vitrine");
    return;
  }
  const nome = ((await perfis.first().getAttribute("aria-label")) ?? "").replace(
    "Ver perfil de ",
    "",
  );
  await perfis.first().click();
  await aguardarCaminho(page, /^\/profissionais\/[^/]+$/);
  await expect(page.getByRole("heading", { level: 2, name: nome })).toBeVisible();
  await page.getByRole("link", { name: "Voltar para profissionais" }).click();
  await aguardarCaminho(page, "/profissionais");
}

export async function conferirBloqueioDoConsole(page: Page) {
  await page.goto("/admin");
  await aguardarCaminho(page, "/admin/pessoas");
  await expect(page.getByText("Acesso restrito").filter({ visible: true })).toBeVisible();
  await page.getByRole("link", { name: "Voltar para o início" }).click();
  await aguardarCaminho(page, "/inicio");
}
