import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { perfilFiliado } from "@/test/fixtures/pessoas";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { handlersGamificacao, painelSemAndamento } from "../mocks/gamificacao.handlers";
import { MENSAGEM_FALHA_SORTEIO } from "./AreaSorteioQuebraCabeca";
import { MOVIMENTO_REDUZIDO } from "./Dado";
import { PaginaConquistas } from "./PaginaConquistas";

let sorteios: number;
let consultasPainel: number;

beforeEach(() => {
  sorteios = 0;
  consultasPainel = 0;
  servidor.events.on("request:start", ({ request }) => {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/gamificacao/sortear-quebra-cabeca") sorteios += 1;
    if (pathname === "/api/gamificacao") consultasPainel += 1;
  });
});

afterEach(() => {
  servidor.events.removeAllListeners();
  vi.restoreAllMocks();
});

function abrir() {
  renderizar(<PaginaConquistas />, { sessao: perfilFiliado });
  servidor.use(...handlersGamificacao(painelSemAndamento));
}

const dado = () => screen.findByRole("button", { name: "Sortear um novo quebra-cabeça" });

function responderSorteio(resposta: () => Response | Promise<Response>) {
  servidor.use(http.post("*/api/gamificacao/sortear-quebra-cabeca", resposta));
}

function simularMovimentoReduzido() {
  const original = window.matchMedia;
  vi.spyOn(window, "matchMedia").mockImplementation((consulta: string) => ({
    ...original(consulta),
    matches: consulta === MOVIMENTO_REDUZIDO,
  }));
}

describe("Sorteio de um novo quebra-cabeça", () => {
  it("sorteia, mostra os parabéns e, ao fechar, o tabuleiro com 0 de 8", async () => {
    abrir();

    await userEvent.click(await dado());
    const modal = await screen.findByRole("dialog", {
      name: "Parabéns! Você tem um novo quebra-cabeça!",
    });
    expect(within(modal).getByText(/Você consegue créditos indo a eventos/)).toBeInTheDocument();

    await userEvent.click(within(modal).getByRole("button", { name: "Entendi, vamos lá!" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const atual = within(screen.getByRole("region", { name: "Quebra-cabeça atual" }));
    expect(atual.getByRole("img", { name: "0 de 8 peças coletadas" })).toBeInTheDocument();
    expect(atual.getByText("Quebra-cabeça em andamento")).toBeInTheDocument();
    expect(sorteios).toBe(1);
  });

  it("mostra a coleção completa quando já concluí todos os publicados", async () => {
    abrir();
    responderSorteio(() => HttpResponse.json({ codigo: "COLECAO_COMPLETA" }, { status: 409 }));

    await userEvent.click(await dado());
    expect(await screen.findByText("🏆 Coleção completa!")).toBeInTheDocument();
    expect(screen.getByText(/Seus créditos continuam guardados/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Sortear/ })).not.toBeInTheDocument();
  });

  it("mostra o catálogo vazio quando não há quebra-cabeças publicados", async () => {
    abrir();
    responderSorteio(() => HttpResponse.json({ codigo: "CATALOGO_VAZIO" }, { status: 409 }));

    await userEvent.click(await dado());
    expect(await screen.findByText("Ainda não há quebra-cabeças publicados.")).toBeInTheDocument();
  });

  it("recarrega o painel quando outra aba já sorteou", async () => {
    abrir();
    await dado();
    const antes = consultasPainel;
    responderSorteio(() =>
      HttpResponse.json({ codigo: "QUEBRA_CABECA_EM_ANDAMENTO" }, { status: 409 }),
    );

    await userEvent.click(await dado());
    await waitFor(() => expect(consultasPainel).toBeGreaterThan(antes));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("avisa quando o sorteio falha por um erro inesperado", async () => {
    abrir();
    responderSorteio(() => new HttpResponse(null, { status: 500 }));

    await userEvent.click(await dado());
    expect(await screen.findByText(MENSAGEM_FALHA_SORTEIO)).toBeInTheDocument();
    expect(await dado()).toBeEnabled();
  });

  it("envia uma única requisição em dois cliques rápidos e anima o dado", async () => {
    abrir();
    responderSorteio(async () => {
      await delay(200);
      return HttpResponse.json({ pecas_obtidas: 0, total_pecas: 8, creditos: 0 }, { status: 201 });
    });

    const botao = await dado();
    await userEvent.dblClick(botao);
    expect(botao).toBeDisabled();
    expect(botao).toHaveAttribute("data-animando", "true");
    await screen.findByRole("dialog");
    expect(sorteios).toBe(1);
  });

  it("não anima o dado com prefers-reduced-motion", async () => {
    simularMovimentoReduzido();
    abrir();
    responderSorteio(async () => {
      await delay(200);
      return HttpResponse.json({ pecas_obtidas: 0, total_pecas: 8, creditos: 0 }, { status: 201 });
    });

    const botao = await dado();
    await userEvent.click(botao);
    expect(botao).toHaveAttribute("aria-busy", "true");
    expect(botao).toHaveAttribute("data-animando", "false");
  });
});
