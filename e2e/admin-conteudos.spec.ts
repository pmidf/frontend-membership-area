import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import {
  categoriasTeste,
  COD_TECNOLOGIA,
} from "../src/features/conteudos/mocks/conteudos.handlers";
import {
  conteudoRascunho,
  conteudosAdminTeste,
  conteudoVideo,
  filtrarConteudosAdmin,
  ID_TRILHA_CRIADA,
  itemTrilhaDe,
  filtrarTrilhasAdmin,
  previaTeste,
  resumosTrilhasAdmin,
  trilhaRascunho,
} from "../src/features/conteudos-admin/mocks/conteudos-admin.handlers";
import type { ConteudoAdmin } from "../src/features/conteudos-admin/tipos/conteudo-admin";
import type { CriarTrilha, TrilhaAdmin } from "../src/features/conteudos-admin/tipos/trilha-admin";
import { perfilAdmin } from "../src/test/fixtures/pessoas";

import { simularSessao } from "./sessao";

async function prepararApi(page: Page, inicial: ConteudoAdmin = conteudoVideo) {
  let conteudo = inicial;
  await simularSessao(page, perfilAdmin);
  await page.route(/youtube-nocookie\.com/, (rota) =>
    rota.fulfill({ contentType: "text/html", body: "<!doctype html><title>Vídeo</title>" }),
  );
  await page.route("**/api/conteudo-categorias", (rota) => rota.fulfill({ json: categoriasTeste }));
  await page.route("**/api/admin/conteudos/youtube/preview", (rota) =>
    rota.fulfill({ json: previaTeste }),
  );
  await page.route("**/api/admin/conteudos*", (rota) => {
    const requisicao = rota.request();
    if (requisicao.method() === "POST") {
      conteudo = {
        ...inicial,
        ...(requisicao.postDataJSON() as Partial<ConteudoAdmin>),
        id_conteudo: "60000000-0000-4000-8000-000000000090",
        situacao: "RASCUNHO",
      };
      return rota.fulfill({ status: 201, json: conteudo });
    }
    return rota.fulfill({
      json: filtrarConteudosAdmin(conteudosAdminTeste, new URL(requisicao.url())),
    });
  });
  await page.route("**/api/admin/conteudos/*-*", (rota) => {
    if (rota.request().method() === "DELETE") {
      conteudo = { ...conteudo, situacao: "ARQUIVADO" };
      return rota.fulfill({ status: 204 });
    }
    return rota.fulfill({ json: conteudo });
  });
}

async function conferirAcessibilidade(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  expect(violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual(
    [],
  );
}

const capturar = (page: Page, nome: string, projeto: string) =>
  page.screenshot({
    path: `test-results/capturas/admin-conteudos-${nome}-${projeto}.png`,
    animations: "disabled",
    fullPage: true,
  });

test("o Admin vê a biblioteca e filtra os rascunhos", async ({ page }, info) => {
  await prepararApi(page);
  await page.goto("/admin/conteudos");
  await expect(page.getByRole("heading", { level: 1, name: "Conteúdo" })).toBeVisible();
  await expect(page.getByText("Página 1 de 2")).toBeVisible();
  await capturar(page, "biblioteca", info.project.name);
  await conferirAcessibilidade(page);

  await page.getByRole("combobox", { name: "Status" }).selectOption("RASCUNHO");
  await expect(page).toHaveURL(/\?situacao=RASCUNHO$/);
  await expect(page.getByRole("link", { name: /^Editar Como montar/ })).toBeVisible();
});

test("o Admin cadastra um vídeo como rascunho", async ({ page }, info) => {
  await prepararApi(page);
  await page.goto("/admin/conteudos/novo");
  await expect(page.getByRole("heading", { level: 1, name: "Novo conteúdo" })).toBeVisible();

  await page.getByLabel("Título").fill("Gestão de riscos em contratos públicos");
  await page.getByLabel("URL").fill("https://youtu.be/dQw4w9WgXcQ");
  await page.getByLabel("Descrição").click();
  await expect(page.getByText("ID extraído automaticamente: dQw4w9WgXcQ")).toBeVisible();
  await page.getByLabel("Descrição").fill("Painel do encontro de novembro.");
  await page.getByLabel("Categoria").selectOption(COD_TECNOLOGIA);
  await capturar(page, "novo", info.project.name);
  await conferirAcessibilidade(page);

  await page.getByRole("button", { name: "Salvar rascunho" }).click();
  await expect(page).toHaveURL(/\/admin\/conteudos\/60000000-0000-4000-8000-000000000090$/);
  await expect(page.getByRole("heading", { level: 1, name: "Edição de conteúdo" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Publicar conteúdo" })).toBeVisible();
});

test("o Admin arquiva um conteúdo publicado", async ({ page }, info) => {
  await prepararApi(page);
  await page.goto(`/admin/conteudos/${conteudoVideo.id_conteudo}`);
  await expect(page.getByRole("heading", { level: 1, name: "Edição de conteúdo" })).toBeVisible();
  await expect(page.getByLabel("Categoria")).toHaveValue(COD_TECNOLOGIA);
  await capturar(page, "edicao", info.project.name);
  await conferirAcessibilidade(page);

  await page.getByRole("button", { name: "Arquivar" }).click();
  await page
    .getByRole("dialog", { name: "Arquivar conteúdo?" })
    .getByRole("button", { name: "Arquivar" })
    .click();

  await expect(page.getByText("Ele saiu do catálogo e não pode mais ser editado.")).toBeVisible();
  await expect(page.getByLabel("Título")).toBeDisabled();
});

test("o Admin cria uma categoria pelo modal", async ({ page }, info) => {
  await prepararApi(page);
  let categorias = [...categoriasTeste];
  await page.route("**/api/conteudo-categorias", (rota) => rota.fulfill({ json: categorias }));
  await page.route("**/api/admin/conteudo-categorias", (rota) => {
    const { desc_categoria } = rota.request().postDataJSON() as { desc_categoria: string };
    const nova = {
      cod_categoria: "50000000-0000-4000-8000-000000000009",
      desc_categoria,
      ordem: 3,
    };
    categorias = [...categorias, nova];
    return rota.fulfill({ status: 201, json: nova });
  });
  await page.goto("/admin/conteudos");

  await page.getByRole("button", { name: "Gerenciar categorias" }).click();
  const dialogo = page.getByRole("dialog", { name: "Categorias" });
  await expect(dialogo.getByText("Tecnologia")).toBeVisible();
  await capturar(page, "categorias", info.project.name);
  await conferirAcessibilidade(page);

  await dialogo.getByLabel("Nova categoria").fill("Carreira");
  await dialogo.getByRole("button", { name: "+ Adicionar" }).click();
  await expect(dialogo.getByRole("listitem").filter({ hasText: "Carreira" })).toBeVisible();
});

test("o Admin vê as estatísticas de um conteúdo", async ({ page }, info) => {
  await prepararApi(page);
  const serie = Array.from({ length: 30 }, (_, indice) => ({
    dia: `2026-10-${String(indice + 1).padStart(2, "0")}`,
    visualizacoes: (indice * 7) % 11,
  }));
  await page.route("**/api/admin/conteudos/*/estatisticas*", (rota) =>
    rota.fulfill({
      json: {
        titulo: conteudoVideo.titulo,
        tipo: "VIDEO",
        situacao: "PUBLICADO",
        data_publicacao: conteudoVideo.data_publicacao,
        visualizacoes_totais: 318,
        espectadores_unicos: 214,
        visualizacoes_recentes: 46,
        serie,
      },
    }),
  );
  await page.route("**/api/admin/conteudos/*/acessos*", (rota) =>
    rota.fulfill({
      json: {
        total_acessos: 2,
        total_espectadores: 2,
        pagina: 1,
        total_paginas: 1,
        acessos: [
          {
            nome: "Carla Menezes",
            cargo: "Diretora de Eventos",
            empresa: "PMI-DF",
            data_acesso: "2026-10-30T17:32:00.000Z",
          },
          {
            nome: "Rafael Lima",
            cargo: "Head de PMO",
            empresa: "",
            data_acesso: "2026-10-29T12:10:00.000Z",
          },
        ],
      },
    }),
  );

  await page.goto(
    `/admin/conteudos/${conteudoVideo.id_conteudo}/estatisticas?de=2026-10-01&ate=2026-10-30`,
  );
  await expect(page.getByRole("heading", { level: 1, name: conteudoVideo.titulo })).toBeVisible();
  await expect(page.getByText("Carla Menezes")).toBeVisible();
  await page.locator("[data-barra]").nth(10).hover();
  await expect(page.getByText("11/10/2026", { exact: true }).first()).toBeAttached();
  await capturar(page, "estatisticas", info.project.name);
  await conferirAcessibilidade(page);
});

test("o Admin monta uma trilha com conteúdos da biblioteca", async ({ page }, info) => {
  await prepararApi(page);
  let trilha: TrilhaAdmin = trilhaRascunho;
  await page.route("**/api/admin/trilhas", (rota) => {
    const corpo = rota.request().postDataJSON() as CriarTrilha;
    trilha = {
      ...trilhaRascunho,
      id_trilha: ID_TRILHA_CRIADA,
      titulo: corpo.titulo,
      descricao: corpo.descricao,
      itens: corpo.ids_conteudos
        .map((id) => conteudosAdminTeste.find(({ id_conteudo }) => id_conteudo === id))
        .filter((conteudo) => conteudo !== undefined)
        .map(itemTrilhaDe),
    };
    return rota.fulfill({ status: 201, json: trilha });
  });
  await page.route("**/api/admin/trilhas/*", (rota) => rota.fulfill({ json: trilha }));

  await page.goto("/admin/conteudos/trilhas/novo");
  await expect(
    page.getByRole("heading", { level: 1, name: "Nova trilha de conhecimento" }),
  ).toBeVisible();
  await page.getByLabel("Título da trilha").fill("Projetos no setor público");
  await page.getByLabel("Descrição").fill("Do PMBOK 7 ao canvas de projeto do PMI-DF.");

  await page.getByRole("button", { name: "+ Adicionar conteúdo da biblioteca" }).click();
  const modal = page.getByRole("dialog", { name: "Adicionar conteúdos" });
  await modal.getByRole("button", { name: `Adicionar ${conteudoVideo.titulo}` }).click();
  await modal.getByRole("button", { name: `Adicionar ${conteudoRascunho.titulo}` }).click();
  await expect(modal.getByText("2 conteúdos na trilha")).toBeVisible();
  await capturar(page, "trilha-seletor", info.project.name);
  await conferirAcessibilidade(page);
  await modal.getByRole("button", { name: "Concluir" }).click();

  await page.getByRole("button", { name: `Subir ${conteudoRascunho.titulo}` }).click();
  await expect(
    page.getByRole("list", { name: "Conteúdos na ordem da trilha" }).getByRole("listitem").first(),
  ).toContainText(conteudoRascunho.titulo);
  await capturar(page, "trilha-nova", info.project.name);
  await conferirAcessibilidade(page);

  await page.getByRole("button", { name: "Salvar rascunho" }).click();
  await expect(page).toHaveURL(new RegExp(`/admin/conteudos/trilhas/${ID_TRILHA_CRIADA}$`));
  await expect(page.getByRole("heading", { level: 1, name: "Edição de trilha" })).toBeVisible();
  expect(trilha.itens.map(({ id_conteudo }) => id_conteudo)).toEqual([
    conteudoRascunho.id_conteudo,
    conteudoVideo.id_conteudo,
  ]);
});

test("o Admin vê as trilhas na aba própria", async ({ page }, info) => {
  await prepararApi(page);
  await page.route("**/api/admin/trilhas*", (rota) =>
    rota.fulfill({
      json: filtrarTrilhasAdmin(resumosTrilhasAdmin, new URL(rota.request().url())),
    }),
  );
  await page.goto("/admin/conteudos");
  await page
    .getByRole("navigation", { name: "Seções do conteúdo" })
    .getByRole("link", { name: "Trilhas" })
    .click();

  await expect(page).toHaveURL(/\/admin\/conteudos\?aba=trilhas$/);
  await expect(
    page.getByRole("link", { name: "Editar Fundamentos de Gestão de Riscos" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "+ Nova trilha" })).toBeVisible();
  await capturar(page, "trilhas", info.project.name);
  await conferirAcessibilidade(page);

  await page.getByRole("combobox", { name: "Status" }).selectOption("RASCUNHO");
  await expect(page).toHaveURL(/\?aba=trilhas&situacao=RASCUNHO$/);
  await expect(page.getByRole("link", { name: `Editar ${trilhaRascunho.titulo}` })).toBeVisible();
});
