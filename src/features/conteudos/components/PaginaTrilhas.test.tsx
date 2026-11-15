import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { beforeEach, describe, expect, it } from "vitest";

import { perfilFiliado } from "@/test/fixtures/pessoas";
import { definirNavegacao } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { handlersTrilhas, resumosTrilhas } from "../mocks/conteudos.handlers";
import { PaginaTrilhas } from "./PaginaTrilhas";

beforeEach(() => definirNavegacao("/conteudos/trilhas"));

function abrir() {
  renderizar(<PaginaTrilhas />, { sessao: perfilFiliado });
}

describe("Página de trilhas", () => {
  it("lista todas as trilhas publicadas com o progresso", async () => {
    abrir();
    servidor.use(...handlersTrilhas());

    expect(await screen.findByRole("heading", { level: 1, name: "Trilhas" })).toBeInTheDocument();
    const cartao = await screen.findByRole("link", { name: "Agilidade na prática" });
    const lista = within(cartao.closest("ul")!);
    expect(lista.getAllByRole("listitem")).toHaveLength(resumosTrilhas.length);
    expect(lista.getByText("Trilha · 1 item")).toBeInTheDocument();
    expect(lista.getByRole("link", { name: "Agilidade na prática" })).toHaveAttribute(
      "href",
      `/conteudos/trilhas/${resumosTrilhas[1].id_trilha}?de=%2Fconteudos%2Ftrilhas`,
    );
    expect(
      lista.getByRole("progressbar", { name: "Progresso na trilha Carreira em projetos" }),
    ).toHaveAttribute("aria-valuenow", "3");
    expect(screen.getByRole("link", { name: /Voltar para o catálogo/ })).toHaveAttribute(
      "href",
      "/conteudos",
    );
  });

  it("avisa quando não há trilhas", async () => {
    abrir();
    servidor.use(...handlersTrilhas([]));

    expect(await screen.findByText("Nenhuma trilha publicada ainda")).toBeInTheDocument();
  });

  it("mostra o erro e tenta de novo", async () => {
    abrir();
    servidor.use(http.get("*/api/trilhas", () => HttpResponse.json({}, { status: 500 })));

    expect(
      await screen.findByText("Não foi possível carregar as trilhas.", {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    servidor.use(...handlersTrilhas());
    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByRole("link", { name: "Agilidade na prática" })).toBeInTheDocument();
  });
});
