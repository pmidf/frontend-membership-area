import { expect, test } from "@playwright/test";

import {
  abrirEventoEmDestaque,
  abrirPrimeiraTrilha,
  abrirPrimeiroConteudoComLink,
  abrirPrimeiroProfissional,
  aguardarCaminho,
  aguardarCarregamento,
  entrar,
  exigirCredenciais,
  irPeloMenu,
  passo,
  sairEConferirBloqueio,
  semDados,
  textoDe,
  tituloDaPagina,
  voltarParaAgenda,
} from "./apoio";

test("o não filiado percorre a área do membro vendo só as prévias", async ({ page }) => {
  const credenciais = exigirCredenciais("E2E_NAO_FILIADO");
  const painelExclusivo = page.getByRole("region", { name: "Exclusivo para filiados" });
  const acoesBloqueadas = page.locator("[data-bloqueado='true'] :is(a, button):visible");

  await passo(page, "entra e chega ao início marcado como não filiado", async () => {
    await entrar(page, credenciais);
    await expect(
      page.getByRole("region", { name: "Você está vendo a versão gratuita" }),
    ).toBeVisible();
    for (const secao of [
      "Próximos eventos",
      "Vantagens que a filiação libera",
      "Conteúdo exclusivo",
    ]) {
      const regiao = page.getByRole("region", { name: secao, exact: true });
      await regiao.scrollIntoViewIfNeeded();
      await expect(regiao).toBeVisible();
    }
    await expect(page.getByRole("list", { name: "Seus números no capítulo" })).toHaveCount(0);
    await page.getByRole("heading", { level: 1, name: /^Olá, / }).scrollIntoViewIfNeeded();
    await expect(page.getByText("Não filiado").filter({ visible: true }).first()).toBeVisible();
    await expect(
      page.getByText("Você está no plano gratuito").filter({ visible: true }),
    ).toBeVisible();
  });

  await passo(page, "vê o clube de benefícios só como prévia", async () => {
    await irPeloMenu(page, "Clube de benefícios", "/beneficios", "Clube de benefícios");
    await aguardarCarregamento(page);
    await expect(painelExclusivo).toBeVisible();
    await expect(
      page.getByText("Disponível para filiados").filter({ visible: true }),
    ).toBeVisible();
    await expect(page.getByRole("searchbox")).toBeDisabled();
    await expect(acoesBloqueadas).toHaveCount(0);
  });

  await passo(page, "abre o evento em destaque da agenda", async () => {
    await abrirEventoEmDestaque(page);
    await voltarParaAgenda(page);
  });

  await passo(page, "vê a prévia do conteúdo exclusivo e a biblioteca", async () => {
    await irPeloMenu(page, "Conteúdo exclusivo", "/conteudos", "Conteúdo exclusivo");
    await expect(page.getByRole("heading", { name: "Você está vendo uma prévia" })).toBeVisible();
    await page.getByRole("link", { name: "Ver biblioteca completa" }).click();
    await aguardarCaminho(page, "/conteudos/biblioteca");
    await expect(tituloDaPagina(page, "Biblioteca completa")).toBeVisible();
    await aguardarCarregamento(page);
    await expect(acoesBloqueadas).toHaveCount(0);
  });

  let conteudoVisto: string | null = null;

  await passo(page, "abre um conteúdo liberado para não filiado", async () => {
    if (!(await abrirPrimeiroConteudoComLink(page))) {
      semDados("nenhum conteúdo liberado para não filiado");
      return;
    }
    conteudoVisto = await textoDe(tituloDaPagina(page));
  });

  await passo(page, "marca o conteúdo como visto", async () => {
    if (!conteudoVisto) return;
    const marcar = page.getByRole("button", {
      name: /^Marcar como (assistido|visto)$/,
    });
    const desmarcar = page.getByRole("button", { name: /^(Assistido|Visto) — desmarcar$/ });
    await expect(marcar.or(desmarcar)).toBeVisible();
    if (await desmarcar.isVisible()) {
      await desmarcar.click();
      await expect(marcar).toBeVisible();
    }
    await marcar.click();
    await expect(desmarcar).toBeVisible();
  });

  await passo(page, "abre o histórico de conteúdos com o conteúdo visto", async () => {
    await page.goto("/conteudos/historico");
    await expect(tituloDaPagina(page, "Histórico")).toBeVisible();
    await aguardarCarregamento(page);
    if (!conteudoVisto) return;
    await expect(
      page.locator('h3 a[href^="/conteudos/"]:visible').filter({ hasText: conteudoVisto }),
    ).toBeVisible();
  });

  await passo(page, "abre uma trilha e vê os itens exclusivos sem link", async () => {
    const itens = await abrirPrimeiraTrilha(page);
    if (!itens) return;
    const exclusivos = itens.filter({ hasText: "Exclusivo para filiados" });
    await expect(exclusivos.locator("a")).toHaveCount(0);
  });

  await passo(page, "vê as vagas só como prévia", async () => {
    await irPeloMenu(page, "Vagas", "/vagas", "Oportunidades de carreira");
    await aguardarCarregamento(page);
    await expect(painelExclusivo).toBeVisible();
    await expect(
      page.getByText("Disponível para filiados").filter({ visible: true }),
    ).toBeVisible();
  });

  await passo(page, "vê os quebra-cabeças de Minhas conquistas bloqueados", async () => {
    await irPeloMenu(page, "Minhas conquistas", "/conquistas", "Seus quebra-cabeças");
    await expect(
      page.getByRole("region", { name: "Você ainda não tem nenhuma peça" }),
    ).toBeVisible();
    await expect(
      page.getByText("Filie-se para começar a colecionar peças").filter({ visible: true }),
    ).toBeVisible();
    await page
      .getByRole("heading", { name: "Catálogo de quebra-cabeças" })
      .scrollIntoViewIfNeeded();
    await expect(page.getByRole("button", { name: /Sortear/ })).toHaveCount(0);
  });

  await passo(page, "vê a comunidade com o aviso de que só filiados se apresentam", async () => {
    await irPeloMenu(page, "Comunidade", "/profissionais", "Profissionais da comunidade");
    await expect(
      page.getByText("Apenas filiados podem se apresentar aqui.").filter({ visible: true }),
    ).toBeVisible();
    await abrirPrimeiroProfissional(page);
  });

  await passo(page, "abre o próprio perfil com a filiação não vinculada", async () => {
    await irPeloMenu(page, "Meu perfil", "/perfil", "Meu perfil");
    await expect(page.getByRole("heading", { name: "Dados pessoais" })).toBeVisible();
    const filiacao = page.getByRole("region", { name: "Filiação PMI" });
    await filiacao.scrollIntoViewIfNeeded();
    await expect(
      filiacao.getByText("Não vinculado", { exact: true }).filter({ visible: true }),
    ).toBeVisible();
    await page.getByRole("heading", { name: "Segurança" }).scrollIntoViewIfNeeded();
  });

  await passo(page, "sai e perde o acesso às telas protegidas", async () => {
    await sairEConferirBloqueio(page, "/conteudos");
  });
});
