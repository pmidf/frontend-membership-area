import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { perfilAdmin } from "@/test/fixtures/pessoas";
import { definirNavegacao, roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { conteudoVideo, handlersEstatisticas } from "../mocks/conteudos-admin.handlers";
import { PaginaEstatisticas } from "./PaginaEstatisticas";

const id = conteudoVideo.id_conteudo;
const ESPERA = 4000;
const CAMINHO = `/admin/conteudos/${id}/estatisticas`;

let usuario: ReturnType<typeof userEvent.setup>;

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
});

afterEach(() => vi.restoreAllMocks());

function abrir(consulta = "de=2026-10-14&ate=2026-11-12", opcoes = {}) {
  definirNavegacao(CAMINHO, consulta, { id });
  const resultado = renderizar(<PaginaEstatisticas />, { sessao: perfilAdmin });
  servidor.use(...handlersEstatisticas(opcoes));
  roteadorFalso.replace.mockImplementation((destino: string) => {
    const [caminho, parametros = ""] = destino.split("?");
    definirNavegacao(caminho, parametros, { id });
    queueMicrotask(() => resultado.rerender(<PaginaEstatisticas />));
  });
  return resultado;
}

const titulo = () =>
  screen.findByRole("heading", { level: 1, name: conteudoVideo.titulo }, { timeout: ESPERA });
const avisos = () => within(screen.getByRole("region", { name: "Avisos" }));
const indicador = (rotulo: string) => screen.getByText(rotulo).parentElement!;

async function aplicarPeriodo(de: string, ate: string) {
  const inicio = screen.getByLabelText("De");
  const fim = screen.getByLabelText("Até");
  await usuario.clear(inicio);
  await usuario.type(inicio, de);
  await usuario.clear(fim);
  await usuario.type(fim, ate);
  await usuario.click(screen.getByRole("button", { name: "Aplicar" }));
}

describe("Estatísticas do conteúdo", { timeout: 15_000 }, () => {
  it("mostra o cabeçalho, os indicadores e o gráfico diário com a tabela equivalente", async () => {
    abrir();
    await titulo();

    expect(
      screen.getByText("Estatísticas de acesso · Vídeo · publicado em 01/10/2026 · Publicado"),
    ).toBeInTheDocument();
    expect(indicador("Visualizações totais")).toHaveTextContent("25");
    expect(indicador("Espectadores únicos")).toHaveTextContent("21");
    expect(indicador("Visualizações nos últimos 7 dias")).toHaveTextContent("6");
    expect(screen.getByText("Por dia · 14/10/2026 a 12/11/2026")).toBeInTheDocument();
    const tabela = screen.getByRole("table", {
      name: "Visualizações por dia, de 14/10/2026 a 12/11/2026",
    });
    expect(within(tabela).getAllByRole("row")).toHaveLength(31);
    expect(within(tabela).getByRole("rowheader", { name: "15/10/2026" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar para o conteúdo" })).toHaveAttribute(
      "href",
      `/admin/conteudos/${id}`,
    );
  });

  it("agrupa por semana e grava o período na URL", async () => {
    abrir();
    await titulo();

    await aplicarPeriodo("2026-08-15", "2026-11-12");

    await waitFor(() =>
      expect(roteadorFalso.replace).toHaveBeenCalledWith(
        `${CAMINHO}?de=2026-08-15&ate=2026-11-12`,
        { scroll: false },
      ),
    );
    expect(await screen.findByText("Por semana · 15/08/2026 a 12/11/2026")).toBeInTheDocument();
    const tabela = screen.getByRole("table", { name: /por semana/ });
    expect(within(tabela).getAllByRole("row")).toHaveLength(14);
  });

  it.each([
    ["2025-01-01", "2026-01-02", "O período pode ter no máximo 366 dias"],
    ["2026-11-10", "2026-11-01", "A data inicial deve ser anterior ou igual à final"],
  ])("recusa o período %s a %s", async (de, ate, mensagem) => {
    abrir();
    await titulo();

    await aplicarPeriodo(de, ate);

    expect(screen.getByText(mensagem)).toBeInTheDocument();
    expect(screen.getByLabelText("De")).toHaveAttribute("aria-invalid", "true");
    expect(roteadorFalso.replace).not.toHaveBeenCalled();
  });

  it("lista quem acessou e carrega mais", async () => {
    abrir();
    await titulo();

    const lista = await screen.findByRole("list", { name: "Pessoas que acessaram" });
    expect(within(lista).getAllByRole("listitem")).toHaveLength(20);
    expect(
      screen.getByText("21 pessoas já acessaram este conteúdo · 25 acessos"),
    ).toBeInTheDocument();
    expect(within(lista).getByText("Gerente de projetos · PMI-DF")).toBeInTheDocument();
    expect(within(lista).getByText("CM")).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Carregar mais" }));

    await waitFor(() => expect(within(lista).getAllByRole("listitem")).toHaveLength(25));
    expect(screen.queryByRole("button", { name: "Carregar mais" })).toBeNull();
  });

  it("exporta o CSV e confirma", async () => {
    URL.createObjectURL = vi.fn(() => "blob:teste");
    URL.revokeObjectURL = vi.fn();
    let nomeBaixado = "";
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      nomeBaixado = this.download;
    });
    abrir();
    await screen.findByRole("list", { name: "Pessoas que acessaram" }, { timeout: ESPERA });

    await usuario.click(screen.getByRole("button", { name: "Exportar CSV" }));

    expect(await avisos().findByText("CSV exportado")).toBeInTheDocument();
    expect(nomeBaixado).toBe(`acessos-${id}.csv`);
  });

  it("avisa quando a exportação falha", async () => {
    abrir();
    await screen.findByRole("list", { name: "Pessoas que acessaram" }, { timeout: ESPERA });
    servidor.use(
      http.get("*/api/admin/conteudos/:id/acessos/export.csv", () =>
        HttpResponse.json({}, { status: 500 }),
      ),
    );

    await usuario.click(screen.getByRole("button", { name: "Exportar CSV" }));

    expect(
      await avisos().findByText("Não foi possível exportar. Tente novamente."),
    ).toBeInTheDocument();
  });

  it("mostra os vazios quando ninguém acessou", async () => {
    abrir("", { acessos: [] });
    await titulo();

    expect(screen.getByText("Ainda não há acessos neste período")).toBeInTheDocument();
    expect(await screen.findByText("Ninguém acessou este conteúdo ainda")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Exportar CSV" })).toBeDisabled();
    expect(screen.getByText(/^Por dia · /)).toBeInTheDocument();
  });

  it("mostra Conteúdo não encontrado no 404", async () => {
    abrir();
    servidor.use(
      http.get("*/api/admin/conteudos/:id/estatisticas", () =>
        HttpResponse.json({ message: "Conteúdo não encontrado" }, { status: 404 }),
      ),
    );

    expect(
      await screen.findByText("Conteúdo não encontrado", {}, { timeout: ESPERA }),
    ).toBeInTheDocument();
  });

  it("mostra o erro e tenta de novo", async () => {
    let falhar = true;
    abrir();
    servidor.use(
      http.get("*/api/admin/conteudos/:id/estatisticas", () =>
        falhar
          ? HttpResponse.json({}, { status: 500 })
          : HttpResponse.json({
              titulo: conteudoVideo.titulo,
              tipo: "VIDEO",
              situacao: "RASCUNHO",
              data_publicacao: null,
              visualizacoes_totais: 0,
              espectadores_unicos: 0,
              visualizacoes_recentes: 0,
              serie: [],
            }),
      ),
    );

    expect(
      await screen.findByText(
        "Não foi possível carregar as estatísticas.",
        {},
        { timeout: ESPERA },
      ),
    ).toBeInTheDocument();
    falhar = false;
    await usuario.click(screen.getByRole("button", { name: "Tentar novamente" }));

    await titulo();
    expect(screen.getByText("Estatísticas de acesso · Vídeo · Rascunho")).toBeInTheDocument();
  });
});
