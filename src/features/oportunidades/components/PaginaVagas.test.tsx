import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { perfilFiliado, perfilNaoFiliado } from "@/test/fixtures/pessoas";
import { definirNavegacao, roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { handlersOportunidades, vagaPorEmail, vagaPorLink } from "../mocks/oportunidades.handlers";
import type { RespostaOportunidades } from "../tipos/oportunidade";
import { PaginaVagas } from "./PaginaVagas";

const ESPERA = 4000;

let usuario: ReturnType<typeof userEvent.setup>;
let consultas: string[];

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
  consultas = [];
  servidor.events.on("request:start", ({ request }) => {
    const url = new URL(request.url);
    if (url.pathname === "/api/oportunidades") consultas.push(url.search);
  });
});

afterEach(() => servidor.events.removeAllListeners());

function abrir(
  consulta = "",
  {
    sessao = perfilFiliado,
    resposta,
  }: { sessao?: typeof perfilFiliado; resposta?: RespostaOportunidades } = {},
) {
  definirNavegacao("/vagas", consulta);
  renderizar(<PaginaVagas />, { sessao });
  servidor.use(...handlersOportunidades(resposta));
}

const lista = () => screen.findByRole("list", { name: "Vagas abertas" }, { timeout: ESPERA });
const linhaDe = (titulo: string) => {
  const linha = screen.getByRole("heading", { name: titulo }).closest("li");
  if (!linha) throw new Error(`Linha de ${titulo} não encontrada`);
  return within(linha);
};

describe("Vagas do filiado", { timeout: 15_000 }, () => {
  it("mostra cabeçalho, aviso, total e as linhas com logo, empresa, modalidade, local e prazos", async () => {
    abrir();
    await lista();

    expect(
      screen.getByRole("heading", { level: 1, name: "Oportunidades de carreira" }),
    ).toBeVisible();
    expect(screen.getByText("O capítulo divulga, não recruta")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "23 vagas abertas" })).toBeInTheDocument();

    const linha = linhaDe(vagaPorLink.titulo);
    const logo = linha.getByText("NT").closest("a");
    expect(logo).toHaveAttribute("href", `/vagas/${vagaPorLink.id_oportunidade}`);
    expect(logo).toHaveAttribute("tabindex", "-1");
    expect(logo).toHaveAttribute("aria-hidden", "true");
    expect(linha.getByText("Nexa Tecnologia · Remoto · Brasil")).toBeInTheDocument();
    expect(linha.getByText("Publicada há 9 dias · expira em 3 dias")).toBeInTheDocument();
    expect(linha.getByText("Encerra em breve")).toBeInTheDocument();
    expect(linha.getByRole("link", { name: `Ver vaga: ${vagaPorLink.titulo}` })).toHaveAttribute(
      "href",
      `/vagas/${vagaPorLink.id_oportunidade}`,
    );

    const outra = linhaDe(vagaPorEmail.titulo);
    expect(outra.getByText("Publicada há 2 dias · expira em 58 dias")).toBeInTheDocument();
    expect(outra.queryByText("Encerra em breve")).toBeNull();
  });

  it("filtra por modalidade pela URL", async () => {
    abrir();
    await lista();

    await usuario.click(screen.getByRole("button", { name: "Remoto" }));

    expect(roteadorFalso.replace).toHaveBeenCalledWith("/vagas?modalidade=REMOTO", {
      scroll: false,
    });
  });

  it("usa os filtros da URL na consulta e leva-os para o detalhe", async () => {
    abrir("modalidade=REMOTO&q=nexa");
    await lista();

    expect(consultas).toContain("?q=nexa&modalidade=REMOTO");
    expect(screen.getByRole("button", { name: "Remoto" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "1 vaga aberta" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: `Ver vaga: ${vagaPorLink.titulo}` })).toHaveAttribute(
      "href",
      `/vagas/${vagaPorLink.id_oportunidade}?modalidade=REMOTO&q=nexa`,
    );
  });

  it("busca por cargo ou empresa", async () => {
    abrir("pagina=2");
    await lista();

    await usuario.type(screen.getByLabelText("Buscar por cargo ou empresa"), "PMO{Enter}");

    await waitFor(() =>
      expect(roteadorFalso.replace).toHaveBeenCalledWith("/vagas?q=PMO", { scroll: false }),
    );
  });

  it("por padrão mostra as mais recentes e oferece a ordem alfabética", async () => {
    abrir("pagina=2&modalidade=PRESENCIAL");
    await lista();

    expect(consultas.at(-1)).not.toContain("ordenar");
    await usuario.click(screen.getByRole("button", { name: "Ver em ordem alfabética" }));

    expect(roteadorFalso.replace).toHaveBeenCalledWith(
      "/vagas?modalidade=PRESENCIAL&ordenar=alfabetica",
      { scroll: false },
    );
  });

  it("em ordem alfabética, consulta o backend com ordenar e permite voltar às mais recentes", async () => {
    abrir("ordenar=alfabetica");
    await lista();

    expect(consultas).toContain("?ordenar=alfabetica");
    const titulos = screen
      .getAllByRole("heading", { level: 3 })
      .map((titulo) => titulo.textContent);
    expect(titulos[0]).toBe("Coordenador de PMO 01");
    expect(titulos).not.toContain(vagaPorLink.titulo);

    await usuario.click(screen.getByRole("button", { name: "Mais recentes primeiro" }));

    expect(roteadorFalso.replace).toHaveBeenCalledWith("/vagas", { scroll: false });
  });

  it("pagina a lista", async () => {
    abrir();
    await lista();

    await usuario.click(screen.getByRole("button", { name: /próxima/i }));

    expect(roteadorFalso.replace).toHaveBeenCalledWith("/vagas?pagina=2", { scroll: false });
  });

  it("mostra vazio com limpar filtros quando o filtro não encontra nada", async () => {
    abrir("q=inexistente");

    expect(
      await screen.findByText("Nenhuma vaga encontrada", {}, { timeout: ESPERA }),
    ).toBeVisible();
    await usuario.click(screen.getByRole("button", { name: "Limpar filtros" }));

    expect(roteadorFalso.replace).toHaveBeenCalledWith("/vagas", { scroll: false });
  });

  it("mostra vazio próprio quando não há vagas abertas", async () => {
    abrir("", { resposta: { total: 0, pagina: 1, total_paginas: 0, itens: [] } });

    expect(
      await screen.findByText("Nenhuma vaga aberta no momento", {}, { timeout: ESPERA }),
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: "Limpar filtros" })).toBeNull();
  });

  it("mostra erro com tentar de novo", async () => {
    definirNavegacao("/vagas");
    renderizar(<PaginaVagas />, { sessao: perfilFiliado });
    servidor.use(http.get("*/api/oportunidades", () => HttpResponse.json({}, { status: 500 })));

    expect(
      await screen.findByText("Não foi possível carregar as vagas.", {}, { timeout: ESPERA }),
    ).toBeVisible();
  });

  it("para quem não é filiado, mostra o painel exclusivo sem dados das vagas", async () => {
    abrir("", {
      sessao: perfilNaoFiliado,
      resposta: { total: 5, itens: [{ logo_empresa: null, bloqueado: true }] },
    });

    expect(
      await screen.findByRole("region", { name: "Exclusivo para filiados" }, { timeout: ESPERA }),
    ).toBeVisible();
    expect(screen.queryByRole("list", { name: "Vagas abertas" })).toBeNull();
    expect(screen.queryByLabelText("Buscar por cargo ou empresa")).toBeNull();
  });
});
