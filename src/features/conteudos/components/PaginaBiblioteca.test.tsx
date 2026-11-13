import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { Perfil } from "@/shared/sessao/tipos";
import { perfilFiliado, perfilNaoFiliado } from "@/test/fixtures/pessoas";
import { definirNavegacao, roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import {
  catalogoFiliado,
  catalogoPrevia,
  COD_MATERIAIS,
  handlersConteudos,
  itemBloqueado,
  montarCatalogo,
  videoPublico,
  videoVisto,
} from "../mocks/conteudos.handlers";
import type { Catalogo } from "../tipos/conteudo";
import { PaginaBiblioteca } from "./PaginaBiblioteca";

let consultas: URLSearchParams[];
let cliques: unknown[];

beforeEach(() => {
  consultas = [];
  cliques = [];
  definirNavegacao("/conteudos/biblioteca");
  servidor.events.on("request:start", async ({ request }) => {
    const url = new URL(request.url);
    if (url.pathname === "/api/conteudos") consultas.push(url.searchParams);
    if (url.pathname === "/api/conversao/cta") cliques.push(await request.clone().json());
  });
});

afterEach(() => servidor.events.removeAllListeners());

function abrir(sessao: Perfil = perfilFiliado, catalogo?: Catalogo) {
  const resultado = renderizar(<PaginaBiblioteca />, { sessao });
  servidor.use(...handlersConteudos(catalogo));
  return resultado;
}

const secao = async (titulo: string) => {
  const heading = await screen.findByRole("heading", { level: 2, name: titulo });
  return within(heading.closest("section")!);
};
const painelPrevia = () => screen.findByRole("region", { name: "Exclusivo para filiados" });

describe("Catálogo do Filiado", () => {
  it("mostra as seções na ordem do backend e nenhum painel de prévia", async () => {
    abrir();

    await secao("Tecnologia");
    const titulos = screen
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent);
    expect(titulos).toEqual(["Tecnologia", "Materiais"]);
    expect(screen.getByText(/^Todos os conteúdos publicados/)).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Exclusivo para filiados" })).toBeNull();
  });

  it("monta o cartão do vídeo com duração, legenda, visto e link", async () => {
    abrir();
    const tecnologia = await secao("Tecnologia");

    expect(tecnologia.getByText("42:10")).toBeInTheDocument();
    expect(tecnologia.getByText("42 min · publicado em 22/08/2026")).toBeInTheDocument();
    expect(tecnologia.getByText("Visto")).toBeInTheDocument();
    expect(tecnologia.getByRole("link", { name: videoVisto.titulo })).toHaveAttribute(
      "href",
      expect.stringContaining(`/conteudos/${videoVisto.id_conteudo}?de=`),
    );
  });

  it("marca como novo o material publicado há menos de 14 dias", async () => {
    abrir();
    const materiais = await secao("Materiais");

    expect(materiais.getByText("Novo")).toBeInTheDocument();
    expect(materiais.getByText("Material")).toBeInTheDocument();
  });
});

describe("Filtros na URL", () => {
  it("envia para a API o que está na URL, com a página em page", async () => {
    definirNavegacao(
      "/conteudos/biblioteca",
      `q=gestao&tipo=VIDEO&categoria=${COD_MATERIAIS}&pagina=2`,
    );
    abrir();

    await secao("Tecnologia");
    expect(Object.fromEntries(consultas[0])).toEqual({
      q: "gestao",
      tipo: "VIDEO",
      categoria: COD_MATERIAIS,
      page: "2",
    });
  });

  it("ignora tipo e categoria inválidos, para não receber 422", async () => {
    definirNavegacao("/conteudos/biblioteca", "tipo=PDF&categoria=abc&pagina=x");
    abrir();

    await secao("Tecnologia");
    expect(Object.fromEntries(consultas[0])).toEqual({});
  });

  it("grava o tipo na URL e volta para a primeira página", async () => {
    definirNavegacao("/conteudos/biblioteca", "pagina=2");
    abrir();
    await secao("Tecnologia");

    await userEvent.click(screen.getByRole("button", { name: "Vídeos" }));

    expect(roteadorFalso.replace).toHaveBeenCalledWith("/conteudos/biblioteca?tipo=VIDEO", {
      scroll: false,
    });
  });

  it("grava a categoria escolhida na URL", async () => {
    abrir();
    await screen.findByRole("option", { name: "Materiais" });

    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Categoria" }), "Materiais");

    expect(roteadorFalso.replace).toHaveBeenCalledWith(
      `/conteudos/biblioteca?categoria=${COD_MATERIAIS}`,
      {
        scroll: false,
      },
    );
  });

  it("foca a busca quando chega com um termo na URL", async () => {
    definirNavegacao("/conteudos/biblioteca", "q=gestao");
    abrir();

    await secao("Tecnologia");
    expect(screen.getByRole("searchbox")).toHaveFocus();
  });

  it("grava a busca na URL", async () => {
    abrir();
    await secao("Tecnologia");

    await userEvent.type(screen.getByRole("searchbox"), "riscos");

    await waitFor(() =>
      expect(roteadorFalso.replace).toHaveBeenCalledWith("/conteudos/biblioteca?q=riscos", {
        scroll: false,
      }),
    );
  });
});

describe("Paginação e estados", () => {
  it("avança de página pela URL", async () => {
    abrir(perfilFiliado, { ...catalogoFiliado, total_paginas: 2 });
    await secao("Tecnologia");

    await userEvent.click(screen.getByRole("button", { name: "Próxima" }));

    expect(roteadorFalso.replace).toHaveBeenCalledWith("/conteudos/biblioteca?pagina=2", {
      scroll: false,
    });
  });

  it("vai para a última página quando a da URL não existe", async () => {
    definirNavegacao("/conteudos/biblioteca", "pagina=9");
    abrir(perfilFiliado, montarCatalogo([], { pagina: 9, total: 25, total_paginas: 2 }));

    await waitFor(() =>
      expect(roteadorFalso.replace).toHaveBeenCalledWith("/conteudos/biblioteca?pagina=2", {
        scroll: false,
      }),
    );
  });

  it("avisa quando nada foi encontrado, sem mexer na URL", async () => {
    abrir(perfilFiliado, montarCatalogo([]));

    expect(await screen.findByText("Nenhum conteúdo encontrado")).toBeInTheDocument();
    expect(roteadorFalso.replace).not.toHaveBeenCalled();
  });

  it("mostra o erro e tenta de novo", async () => {
    let falhar = true;
    abrir();
    servidor.use(
      http.get("*/api/conteudos", () =>
        falhar ? HttpResponse.json({}, { status: 500 }) : HttpResponse.json(catalogoFiliado),
      ),
    );

    expect(await screen.findByText("Não foi possível carregar os conteúdos.")).toBeInTheDocument();
    falhar = false;
    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    await secao("Tecnologia");
  });
});

describe("Prévia para quem não é Filiado", () => {
  it("mostra o painel de prévia e o subtítulo próprio", async () => {
    abrir(perfilNaoFiliado, catalogoPrevia);

    const painel = within(await painelPrevia());
    expect(painel.getByRole("heading", { name: "Você está vendo uma prévia" })).toBeInTheDocument();
    expect(painel.queryByRole("link", { name: "Já sou filiado" })).toBeNull();
    expect(
      screen.getByText(/Os exclusivos ficam liberados para quem é filiado/),
    ).toBeInTheDocument();
  });

  it("registra a origem CONTEUDO ao clicar em Quero me filiar", async () => {
    abrir(perfilNaoFiliado, catalogoPrevia);
    const botao = within(await painelPrevia()).getByRole("link", { name: /Quero me filiar/ });
    botao.addEventListener("click", (evento) => evento.preventDefault());

    await userEvent.click(botao);

    await waitFor(() => expect(cliques).toEqual([{ origem: "CONTEUDO" }]));
  });

  it("mostra o título do exclusivo nítido, com o resto borrado e sem acesso", async () => {
    const { container } = abrir(perfilNaoFiliado, catalogoPrevia);
    const tecnologia = await secao("Tecnologia");

    const bloqueados = container.querySelectorAll("[data-bloqueado='true']");
    expect(bloqueados).toHaveLength(1);
    const cartao = within(bloqueados[0] as HTMLElement);
    const titulo = cartao.getByRole("heading", { level: 3, name: itemBloqueado.titulo });
    expect(titulo.closest("[class*='blur-']")).toBeNull();
    expect(cartao.getByText("Exclusivo para filiados").closest(".blur-sm")).toBeNull();
    expect(cartao.getByText("Vídeo", { ignore: false }).closest(".blur-sm")).not.toBeNull();
    expect(bloqueados[0].querySelector("a, button")).toBeNull();
    expect(tecnologia.queryByRole("link", { name: itemBloqueado.titulo })).toBeNull();
  });

  it("mantém o item público normal e clicável", async () => {
    const { container } = abrir(perfilNaoFiliado, catalogoPrevia);
    const tecnologia = await secao("Tecnologia");

    expect(tecnologia.getByRole("link", { name: videoPublico.titulo })).toHaveAttribute(
      "href",
      expect.stringContaining(`/conteudos/${videoPublico.id_conteudo}?de=`),
    );
    expect(container.querySelectorAll("[data-bloqueado='true'] a")).toHaveLength(0);
  });

  it("mantém busca e filtros funcionando", async () => {
    abrir(perfilNaoFiliado, catalogoPrevia);
    await painelPrevia();
    await secao("Tecnologia");

    expect(screen.getByRole("searchbox")).toBeEnabled();
    await userEvent.click(screen.getByRole("button", { name: "Materiais" }));

    expect(roteadorFalso.replace).toHaveBeenCalledWith("/conteudos/biblioteca?tipo=MATERIAL", {
      scroll: false,
    });
  });
});
