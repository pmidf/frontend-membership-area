import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { beforeEach, describe, expect, it } from "vitest";

import type { Perfil } from "@/shared/sessao/tipos";
import { perfilFiliado, perfilNaoFiliado } from "@/test/fixtures/pessoas";
import { definirNavegacao, roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import {
  catalogoFiliado,
  catalogoPrevia,
  COD_TECNOLOGIA,
  handlersConteudos,
  itemBloqueado,
  materialNovo,
  montarCatalogo,
  videoPublico,
  videoVisto,
} from "../mocks/conteudos.handlers";
import type { Catalogo, ItemCatalogoCompleto } from "../tipos/conteudo";
import { PaginaConteudos } from "./PaginaConteudos";

beforeEach(() => definirNavegacao("/conteudos"));

function abrir(sessao: Perfil = perfilFiliado, catalogo?: Catalogo) {
  const resultado = renderizar(<PaginaConteudos />, { sessao });
  servidor.use(...handlersConteudos(catalogo));
  return resultado;
}

const secao = async (titulo: string) => {
  const heading = await screen.findByRole("heading", { level: 2, name: titulo });
  return within(heading.closest("section")!);
};
const grupo = (itens: Catalogo["categorias"][number]["itens"]) => ({
  cod_categoria: COD_TECNOLOGIA,
  desc_categoria: "Tecnologia",
  itens,
});
const video = (numero: number, extras: Partial<ItemCatalogoCompleto> = {}) => ({
  ...videoPublico,
  id_conteudo: `id-${numero}`,
  titulo: `Vídeo ${numero}`,
  data_publicacao: `2026-10-${String(numero).padStart(2, "0")}T12:00:00.000Z`,
  ...extras,
});

describe("Catálogo resumido", () => {
  it("mostra Assistidos e Adicionados recentemente, com os links e sem paginação", async () => {
    abrir();

    const assistidos = await secao("Assistidos");
    expect(assistidos.getByRole("link", { name: videoVisto.titulo })).toBeInTheDocument();
    expect(assistidos.getByRole("link", { name: "Ver histórico" })).toHaveAttribute(
      "href",
      "/conteudos/historico",
    );
    const recentes = await secao("Adicionados recentemente");
    expect(recentes.getByRole("link", { name: "Ver biblioteca completa" })).toHaveAttribute(
      "href",
      "/conteudos/biblioteca",
    );
    expect(recentes.getByRole("link", { name: materialNovo.titulo })).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Paginação" })).toBeNull();
    expect(screen.getByText(/em um só lugar\.$/)).toBeInTheDocument();
  });

  it("mostra só os 3 mais recentes de cada seção", async () => {
    const itens = [1, 2, 3, 4].map((numero) => video(numero, { consumido: true }));
    abrir(perfilFiliado, montarCatalogo([grupo(itens)]));

    const recentes = await secao("Adicionados recentemente");
    const titulos = recentes.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titulos).toEqual(["Vídeo 4", "Vídeo 3", "Vídeo 2"]);
    expect((await secao("Assistidos")).getAllByRole("heading", { level: 3 })).toHaveLength(3);
  });

  it("junta todas as páginas da API antes de escolher os recentes", async () => {
    renderizar(<PaginaConteudos />, { sessao: perfilFiliado });
    servidor.use(
      http.get("*/api/conteudos", ({ request }) => {
        const pagina = new URL(request.url).searchParams.get("page");
        const itens = pagina === "2" ? [video(9)] : [video(1)];
        return HttpResponse.json(montarCatalogo([grupo(itens)], { total_paginas: 2 }));
      }),
    );

    const recentes = await secao("Adicionados recentemente");
    expect(
      recentes.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent),
    ).toEqual(["Vídeo 9", "Vídeo 1"]);
  });

  it("esconde Assistidos quando nada foi visto", async () => {
    abrir(perfilFiliado, montarCatalogo([grupo([video(1)])]));

    await secao("Adicionados recentemente");
    expect(screen.queryByRole("heading", { level: 2, name: "Assistidos" })).toBeNull();
  });

  it("avisa quando não há conteúdos", async () => {
    abrir(perfilFiliado, montarCatalogo([]));

    expect(await screen.findByText("Nenhum conteúdo encontrado")).toBeInTheDocument();
  });

  it("mostra o erro e tenta de novo", async () => {
    let falhar = true;
    renderizar(<PaginaConteudos />, { sessao: perfilFiliado });
    servidor.use(
      http.get("*/api/conteudos", () =>
        falhar ? HttpResponse.json({}, { status: 500 }) : HttpResponse.json(catalogoFiliado),
      ),
    );

    expect(await screen.findByText("Não foi possível carregar os conteúdos.")).toBeInTheDocument();
    falhar = false;
    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    await secao("Adicionados recentemente");
  });
});

describe("Filtros do resumo levam à biblioteca", () => {
  it("abre a biblioteca com o tipo escolhido", async () => {
    abrir();
    await secao("Adicionados recentemente");

    await userEvent.click(screen.getByRole("button", { name: "Vídeos" }));

    expect(roteadorFalso.push).toHaveBeenCalledWith("/conteudos/biblioteca?tipo=VIDEO");
  });

  it("abre a biblioteca com o termo buscado", async () => {
    abrir();
    await secao("Adicionados recentemente");

    await userEvent.type(screen.getByRole("searchbox"), "riscos");

    await waitFor(
      () => expect(roteadorFalso.push).toHaveBeenCalledWith("/conteudos/biblioteca?q=riscos"),
      { timeout: 2000 },
    );
  });

  it("não navega ao clicar em Tudo", async () => {
    abrir();
    await secao("Adicionados recentemente");

    await userEvent.click(screen.getByRole("button", { name: "Tudo" }));

    expect(roteadorFalso.push).not.toHaveBeenCalled();
  });

  it("não oferece o filtro de categoria no resumo", async () => {
    abrir();
    await secao("Adicionados recentemente");

    expect(screen.queryByRole("combobox", { name: "Categoria" })).toBeNull();
  });
});

describe("Resumo para quem não é Filiado", () => {
  it("mostra o painel e ordena o exclusivo pela data", async () => {
    abrir(perfilNaoFiliado, catalogoPrevia);

    expect(
      await screen.findByRole("heading", { name: "Você está vendo uma prévia" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/liberado por completo para quem é filiado/)).toBeInTheDocument();
    const recentes = await secao("Adicionados recentemente");
    const [primeiro] = recentes.getAllByRole("heading", { level: 3 });
    expect(primeiro).toHaveTextContent(itemBloqueado.titulo);
    expect(primeiro.querySelector("a")).toBeNull();
  });
});
