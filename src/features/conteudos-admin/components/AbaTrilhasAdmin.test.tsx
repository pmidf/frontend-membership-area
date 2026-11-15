import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { beforeEach, describe, expect, it } from "vitest";

import { perfilAdmin } from "@/test/fixtures/pessoas";
import { definirNavegacao, roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import {
  handlersConteudosAdmin,
  handlersTrilhasAdmin,
  trilhaArquivada,
  trilhaPublicada,
  trilhaRascunho,
} from "../mocks/conteudos-admin.handlers";
import { PaginaConteudosAdmin } from "./PaginaConteudosAdmin";

const ESPERA = 4000;

let usuario: ReturnType<typeof userEvent.setup>;

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
});

function abrir(consulta = "aba=trilhas") {
  definirNavegacao("/admin/conteudos", consulta);
  const resultado = renderizar(<PaginaConteudosAdmin />, { sessao: perfilAdmin });
  servidor.use(...handlersConteudosAdmin(), ...handlersTrilhasAdmin());
  roteadorFalso.replace.mockImplementation((destino: string) => {
    const [caminho, parametros = ""] = destino.split("?");
    definirNavegacao(caminho, parametros);
    queueMicrotask(() => resultado.rerender(<PaginaConteudosAdmin />));
  });
  return resultado;
}

const tabela = () =>
  screen.findByRole("table", { name: "Trilhas de conhecimento" }, { timeout: ESPERA });

async function linhas() {
  return within(await tabela())
    .getAllByRole("row")
    .slice(1);
}

describe("Aba Trilhas do admin de conteúdo", { timeout: 15_000 }, () => {
  it("marca a aba, troca o botão do cabeçalho e mostra os indicadores", async () => {
    abrir();

    const abas = screen.getByRole("navigation", { name: "Seções do conteúdo" });
    expect(within(abas).getByRole("link", { name: "Trilhas" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(abas).getByRole("link", { name: "Conteúdos" })).toHaveAttribute(
      "href",
      "/admin/conteudos",
    );
    expect(screen.getByRole("link", { name: "+ Nova trilha" })).toHaveAttribute(
      "href",
      "/admin/conteudos/trilhas/novo",
    );
    expect(screen.queryByRole("button", { name: "Gerenciar categorias" })).toBeNull();
    expect(await linhas()).toHaveLength(20);
    expect(screen.getByText("Trilhas publicadas")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("21")).toBeInTheDocument());
  });

  it("descreve cada trilha e leva a edição com os filtros", async () => {
    abrir("aba=trilhas&situacao=RASCUNHO");

    const [linha] = await linhas();
    const celulas = within(linha);
    expect(celulas.getByText(trilhaRascunho.titulo)).toBeInTheDocument();
    expect(celulas.getByText("Nunca publicada")).toBeInTheDocument();
    expect(celulas.getByText("2")).toBeInTheDocument();
    expect(celulas.getByText("Rascunho")).toBeInTheDocument();
    expect(celulas.getByRole("link", { name: `Editar ${trilhaRascunho.titulo}` })).toHaveAttribute(
      "href",
      `/admin/conteudos/trilhas/${trilhaRascunho.id_trilha}?aba=trilhas&situacao=RASCUNHO`,
    );
  });

  it("mostra Ver para a trilha arquivada e a data de publicação", async () => {
    abrir("aba=trilhas&situacao=ARQUIVADO");

    const [linha] = await linhas();
    expect(
      within(linha).getByRole("link", { name: `Ver ${trilhaArquivada.titulo}` }),
    ).toBeInTheDocument();
    expect(within(linha).getByText("Publicada em 11/11/2026")).toBeInTheDocument();
  });

  it("filtra por status e busca, gravando na URL", async () => {
    abrir();
    await tabela();

    await usuario.selectOptions(screen.getByLabelText("Status"), "PUBLICADO");
    await waitFor(() =>
      expect(roteadorFalso.replace).toHaveBeenLastCalledWith(
        "/admin/conteudos?aba=trilhas&situacao=PUBLICADO",
        { scroll: false },
      ),
    );

    await usuario.type(screen.getByLabelText("Buscar trilha"), "Trilha 07");
    await waitFor(
      () =>
        expect(roteadorFalso.replace).toHaveBeenLastCalledWith(
          "/admin/conteudos?aba=trilhas&situacao=PUBLICADO&q=Trilha+07",
          { scroll: false },
        ),
      { timeout: ESPERA },
    );
    await waitFor(async () => expect(await linhas()).toHaveLength(1));
  });

  it("pagina a lista", async () => {
    abrir();
    await tabela();

    await usuario.click(screen.getByRole("button", { name: "Próxima" }));

    await waitFor(() =>
      expect(roteadorFalso.replace).toHaveBeenLastCalledWith(
        "/admin/conteudos?aba=trilhas&pagina=2",
        { scroll: false },
      ),
    );
    await waitFor(async () => expect(await linhas()).toHaveLength(3));
  });

  it("mostra o vazio sem filtro e limpa filtros quando há", async () => {
    abrir("aba=trilhas&q=inexistente");

    expect(
      await screen.findByText("Nenhuma trilha encontrada", {}, { timeout: ESPERA }),
    ).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(roteadorFalso.replace).toHaveBeenLastCalledWith("/admin/conteudos?aba=trilhas", {
      scroll: false,
    });
  });

  it("avisa quando ainda não há trilhas", async () => {
    abrir();
    servidor.use(...handlersTrilhasAdmin([]));

    expect(
      await screen.findByText("Nenhuma trilha criada ainda", {}, { timeout: ESPERA }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Limpar filtros" })).toBeNull();
  });

  it("mostra o erro e tenta de novo", async () => {
    abrir();
    servidor.use(http.get("*/api/admin/trilhas", () => HttpResponse.json({}, { status: 500 })));

    expect(
      await screen.findByText("Não foi possível carregar as trilhas.", {}, { timeout: ESPERA }),
    ).toBeInTheDocument();
    servidor.use(...handlersTrilhasAdmin());
    await usuario.click(screen.getByRole("button", { name: "Tentar novamente" }));

    await tabela();
    expect(screen.getAllByText(trilhaPublicada.titulo).length).toBeGreaterThan(0);
  });
});
