import { expect, test } from "@playwright/test";

import {
  abrirEventoEmDestaque,
  abrirPrimeiraTrilha,
  abrirPrimeiroProfissional,
  aguardarCaminho,
  aguardarCarregamento,
  conferirBloqueioDoConsole,
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

const ESPERA_DO_PAINEL_MS = 120_000;
const PAUSA_PARA_LER_MS = 2000;

test("o filiado percorre a área do membro com tudo liberado", async ({ page }) => {
  const credenciais = exigirCredenciais("E2E_FILIADO");
  const painelExclusivo = page.getByRole("region", { name: "Exclusivo para filiados" });
  const cartoesBloqueados = page.locator("[data-bloqueado='true']:visible");

  await passo(page, "entra e chega ao início marcado como filiado ativo", async () => {
    await entrar(page, credenciais);
    await expect(page.getByText("Filiado ativo").filter({ visible: true }).first()).toBeVisible();
    await expect(
      page.getByRole("list", { name: "Seus números no capítulo" }).getByRole("listitem"),
    ).toHaveCount(3);
    for (const secao of [
      "Próximos eventos",
      "Vantagens do momento",
      "Conteúdo exclusivo recente",
    ]) {
      const regiao = page.getByRole("region", { name: secao, exact: true });
      await regiao.scrollIntoViewIfNeeded();
      await expect(regiao).toBeVisible();
    }
    await expect(
      page.getByRole("region", { name: "Você está vendo a versão gratuita" }),
    ).toHaveCount(0);
    await page.getByRole("heading", { level: 1, name: /^Olá, / }).scrollIntoViewIfNeeded();
    await expect(
      page.getByText("Você está no plano gratuito").filter({ visible: true }),
    ).toHaveCount(0);
  });

  await passo(page, "vê o catálogo completo do clube de benefícios", async () => {
    await irPeloMenu(page, "Clube de benefícios", "/beneficios", "Clube de benefícios");
    await aguardarCarregamento(page);
    await expect(painelExclusivo).toHaveCount(0);
    await expect(cartoesBloqueados).toHaveCount(0);
    await expect(page.getByRole("searchbox")).toBeEnabled();
  });

  await passo(page, "busca um benefício, abre o detalhe e resgata", async () => {
    const beneficios = page.getByRole("list", { name: "Benefícios" }).locator("h3 a");
    if ((await beneficios.count()) === 0) {
      semDados("nenhum benefício publicado");
      return;
    }
    const titulo = await textoDe(beneficios.first());
    const termo = titulo.split(" ").slice(0, 3).join(" ");

    await page.getByRole("searchbox").fill(termo);
    await page.waitForURL((url) => url.searchParams.get("q") === termo);
    await aguardarCarregamento(page);
    await beneficios.filter({ hasText: titulo }).first().click();

    await page.waitForURL(
      (url) => url.pathname.startsWith("/beneficios/") && url.searchParams.get("q") === termo,
    );
    await expect(tituloDaPagina(page, titulo)).toBeVisible();

    await page
      .getByRole("button", { name: /^(Resgatar vantagem|Ver código|Ver instruções)$/ })
      .click();
    const resultado = page.getByRole("dialog", {
      name: /^(Seu código está pronto|Siga as instruções)$/,
    });
    await expect(resultado).toBeVisible();
    await page.waitForTimeout(PAUSA_PARA_LER_MS);
    await resultado.getByRole("button", { name: "Fechar" }).first().click();
    await expect(resultado).toBeHidden();
    await expect(page.getByRole("button", { name: /^(Ver código|Ver instruções)$/ })).toBeVisible();

    await page.getByRole("link", { name: "Voltar para o clube de benefícios" }).click();
    await page.waitForURL(
      (url) => url.pathname === "/beneficios" && url.searchParams.get("q") === termo,
    );
  });

  await passo(page, "abre um evento e vê o próprio e-mail no aviso de inscrição", async () => {
    await abrirEventoEmDestaque(page);
    const inscricao = page.locator('button[aria-haspopup="dialog"]:visible');
    if ((await inscricao.count()) > 0) {
      await inscricao.click();
      const aviso = page.getByRole("dialog");
      await expect(aviso).toContainText(credenciais.email, { ignoreCase: true });
      await aviso.getByRole("button", { name: "Cancelar" }).click();
      await expect(aviso).toBeHidden();
    } else {
      semDados("o evento em destaque não aceita inscrição");
    }
    await voltarParaAgenda(page);
  });

  await passo(page, "vê a agenda no calendário e navega entre os meses", async () => {
    const visao = page.getByRole("navigation", { name: "Visão da agenda" });
    await visao.getByRole("link", { name: "Calendário", exact: true }).click();
    await page.waitForURL((url) => url.searchParams.get("visao") === "calendario");
    const mes = page.locator("#titulo-mes:visible");
    await expect(mes).toBeVisible();
    const mesInicial = await textoDe(mes);
    await page.getByLabel("Próximo mês", { exact: true }).filter({ visible: true }).click();
    await expect(mes).not.toHaveText(mesInicial);
    await page.getByLabel("Mês anterior", { exact: true }).filter({ visible: true }).click();
    await expect(mes).toHaveText(mesInicial);
    await visao.getByRole("link", { name: "Lista", exact: true }).click();
    await page.waitForURL((url) => !url.searchParams.has("visao"));
  });

  await passo(page, "filtra os eventos por formato", async () => {
    const formato = page.getByRole("combobox", { name: "Formato", exact: true });
    await formato.selectOption("online");
    await page.waitForURL((url) => url.searchParams.get("formato") === "online");
    await expect(page.locator("#titulo-proximos:visible")).toHaveText("Eventos encontrados");
    const encontrados = page.locator(
      '[aria-labelledby="titulo-proximos"] li a[href^="/agenda/"]:visible',
    );
    const total = await encontrados.count();
    if (total === 0) semDados("nenhum evento online nos próximos meses");
    for (let indice = 0; indice < total; indice += 1) {
      await expect(encontrados.nth(indice)).toContainText("Online");
    }
    await formato.selectOption("");
    await page.waitForURL((url) => !url.searchParams.has("formato"));
  });

  await passo(page, "filtra os eventos pelo período", async () => {
    const periodo = page.getByRole("combobox", { name: "Período", exact: true });
    await periodo.selectOption("passados");
    await page.waitForURL((url) => url.searchParams.get("periodo") === "passados");
    await expect(page.locator("#titulo-passados:visible")).toHaveText("Eventos passados");
    await expect(
      page.locator('[aria-labelledby="titulo-passados"] li a[href^="/agenda/"]:visible').first(),
    ).toBeVisible();
    await periodo.selectOption("");
    await page.waitForURL((url) => !url.searchParams.has("periodo"));
  });

  await passo(page, "vê o conteúdo exclusivo liberado e a biblioteca sem bloqueios", async () => {
    await irPeloMenu(page, "Conteúdo exclusivo", "/conteudos", "Conteúdo exclusivo");
    await aguardarCarregamento(page);
    await expect(page.getByRole("heading", { name: "Você está vendo uma prévia" })).toHaveCount(0);
    await expect(cartoesBloqueados).toHaveCount(0);
    await page.getByRole("link", { name: "Ver biblioteca completa" }).click();
    await aguardarCaminho(page, "/conteudos/biblioteca");
    await expect(tituloDaPagina(page, "Biblioteca completa")).toBeVisible();
    await aguardarCarregamento(page);
    await expect(cartoesBloqueados).toHaveCount(0);
  });

  await passo(page, "filtra a biblioteca por vídeos e abre um vídeo", async () => {
    await page.getByRole("button", { name: "Vídeos", exact: true }).click();
    await page.waitForURL((url) => url.searchParams.get("tipo") === "VIDEO");
    await aguardarCarregamento(page);
    const videos = page.locator(
      'h3 a[href^="/conteudos/"]:not([href^="/conteudos/trilhas"]):visible',
    );
    if ((await videos.count()) === 0) {
      semDados("nenhum vídeo publicado");
      return;
    }
    const titulo = await textoDe(videos.first());
    await videos.first().click();
    await aguardarCaminho(page, /^\/conteudos\/[^/]+$/);
    await expect(tituloDaPagina(page, titulo)).toBeVisible();
    await expect(page.locator("iframe:visible")).toBeVisible();
  });

  await passo(page, "marca o vídeo como assistido", async () => {
    const marcar = page.getByRole("button", { name: "Marcar como assistido", exact: true });
    const desmarcar = page.getByRole("button", { name: "Assistido — desmarcar", exact: true });
    if ((await page.locator("iframe:visible").count()) === 0) return;
    await expect(marcar.or(desmarcar)).toBeVisible();
    if (await desmarcar.isVisible()) {
      await desmarcar.click();
      await expect(marcar).toBeVisible();
    }
    await marcar.click();
    await expect(desmarcar).toBeVisible();
  });

  await passo(page, "abre o histórico de conteúdos", async () => {
    await page.goto("/conteudos/historico");
    await expect(tituloDaPagina(page, "Histórico")).toBeVisible();
  });

  await passo(page, "abre uma trilha com o progresso e todos os itens liberados", async () => {
    const itens = await abrirPrimeiraTrilha(page);
    if (!itens) return;
    await expect(page.getByRole("heading", { name: "Seu progresso" })).toBeVisible();
    await expect(itens.locator("a")).toHaveCount(await itens.count());
    await expect(page.getByText("Exclusivo para filiados").filter({ visible: true })).toHaveCount(
      0,
    );
  });

  await passo(page, "vê as vagas e abre uma vaga aberta", async () => {
    await irPeloMenu(page, "Vagas", "/vagas", "Oportunidades de carreira");
    await aguardarCarregamento(page);
    await expect(painelExclusivo).toHaveCount(0);
    await expect(
      page.getByText("O capítulo divulga, não recruta").filter({ visible: true }),
    ).toBeVisible();
    await expect(page.getByRole("searchbox")).toBeEnabled();

    const vagas = page.getByRole("link", { name: /^Ver vaga: / });
    if ((await vagas.count()) === 0) {
      semDados("nenhuma vaga aberta");
      return;
    }
    const titulo = ((await vagas.first().getAttribute("aria-label")) ?? "").replace(
      "Ver vaga: ",
      "",
    );
    await vagas.first().click();
    await aguardarCaminho(page, /^\/vagas\/[^/]+$/);
    await expect(tituloDaPagina(page, titulo)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Como se candidatar" })).toBeVisible();
    await page.getByRole("link", { name: "Voltar para as vagas" }).click();
    await aguardarCaminho(page, "/vagas");
  });

  await passo(page, "ordena as vagas em ordem alfabética", async () => {
    const titulos = page.getByRole("list", { name: "Vagas abertas" }).locator("h3");
    if ((await titulos.count()) < 2) {
      semDados("menos de duas vagas abertas para ordenar");
      return;
    }
    await page.getByRole("button", { name: "Ver em ordem alfabética" }).click();
    await page.waitForURL((url) => url.searchParams.get("ordenar") === "alfabetica");
    await aguardarCarregamento(page);
    await expect(page.getByRole("button", { name: "Mais recentes primeiro" })).toBeVisible();
    const ordenados = (await titulos.allTextContents()).map((titulo) => titulo.trim());
    const comparar = new Intl.Collator("pt-BR", { sensitivity: "base" }).compare;
    expect(ordenados).toEqual([...ordenados].sort(comparar));
  });

  await passo(page, "vê o painel de quebra-cabeças de Minhas conquistas", async () => {
    const inicio = Date.now();
    await irPeloMenu(page, "Minhas conquistas", "/conquistas", "Seus quebra-cabeças");
    await expect(page.getByRole("region", { name: "Resumo da coleção" })).toBeVisible({
      timeout: ESPERA_DO_PAINEL_MS,
    });
    const segundos = Math.round((Date.now() - inicio) / 1000);
    if (segundos > 10) {
      test.info().annotations.push({
        type: "lentidão",
        description: `o painel de quebra-cabeças levou ${segundos} s para carregar`,
      });
    }
    await expect(
      page.getByText("Você ainda não tem nenhuma peça").filter({ visible: true }),
    ).toHaveCount(0);
    await page.getByRole("heading", { name: "Quebra-cabeça atual" }).scrollIntoViewIfNeeded();
    await page
      .getByRole("heading", { name: "Catálogo de quebra-cabeças" })
      .scrollIntoViewIfNeeded();
  });

  await passo(page, "vê a comunidade sem o aviso de que só filiados se apresentam", async () => {
    await irPeloMenu(page, "Comunidade", "/profissionais", "Profissionais da comunidade");
    await expect(
      page.getByText("Apenas filiados podem se apresentar aqui.").filter({ visible: true }),
    ).toHaveCount(0);
    await abrirPrimeiroProfissional(page);
  });

  await passo(
    page,
    "abre o próprio perfil com a filiação aprovada e o nome bloqueado",
    async () => {
      await irPeloMenu(page, "Meu perfil", "/perfil", "Meu perfil");
      await expect(page.getByRole("textbox", { name: "Nome completo" })).not.toBeEditable();
      const filiacao = page.getByRole("region", { name: "Filiação PMI" });
      await filiacao.scrollIntoViewIfNeeded();
      await expect(
        filiacao.getByText("Filiado PMI-DF", { exact: true }).filter({ visible: true }),
      ).toBeVisible();
      await page.getByRole("heading", { name: "Segurança" }).scrollIntoViewIfNeeded();
    },
  );

  await passo(page, "confere o acesso ao console administrativo conforme o papel", async () => {
    const ehAdmin =
      (await page
        .getByRole("complementary")
        .getByRole("link", { name: "Console administrativo" })
        .count()) > 0;
    if (!ehAdmin) {
      await conferirBloqueioDoConsole(page);
      return;
    }
    test.info().annotations.push({
      type: "conta admin",
      description: "a conta também é admin, então o console abre em vez de bloquear",
    });
    await page.goto("/admin");
    await aguardarCaminho(page, "/admin/pessoas");
    await expect(tituloDaPagina(page, "Pessoas")).toBeVisible();
    await page.getByRole("link", { name: "Voltar à área do membro" }).click();
    await aguardarCaminho(page, "/inicio");
  });

  await passo(page, "sai e perde o acesso às telas protegidas", async () => {
    await sairEConferirBloqueio(page, "/vagas");
  });
});
