import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { perfilFiliado } from "@/test/fixtures/pessoas";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import {
  handlersGamificacao,
  painelTeste,
  quebraCabecaQuaseCompleto,
  recorte,
} from "../mocks/gamificacao.handlers";
import type { PainelGamificacao } from "../tipos/gamificacao";
import { MENSAGEM_FALHA_PECA } from "./AreaSorteioPeca";
import { PaginaConquistas } from "./PaginaConquistas";

let sorteios: number;

beforeEach(() => {
  sorteios = 0;
  servidor.events.on("request:start", ({ request }) => {
    if (new URL(request.url).pathname === "/api/gamificacao/sortear-peca") sorteios += 1;
  });
});

afterEach(() => servidor.events.removeAllListeners());

function painelCom(pecas: number, creditos: number): PainelGamificacao {
  return {
    ...painelTeste,
    creditos,
    em_andamento: {
      pecas_obtidas: pecas,
      total_pecas: 8,
      pecas: Array.from({ length: pecas }, (_, indice) => ({ indice, recorte: recorte(indice) })),
    },
  };
}

function abrir(painel: PainelGamificacao) {
  renderizar(<PaginaConquistas />, { sessao: perfilFiliado });
  servidor.use(...handlersGamificacao(painel));
}

const botaoSortear = () => screen.findByRole("button", { name: /Sortear nova peça/ });
const atual = () => within(screen.getByRole("region", { name: "Quebra-cabeça atual" }));
const creditos = () =>
  within(screen.getByRole("region", { name: "Resumo da coleção" }))
    .getByText("Créditos disponíveis")
    .closest("div") as HTMLElement;

describe("Sorteio de peça com crédito", () => {
  it("troca um crédito por uma peça e a encaixa no tabuleiro ao continuar", async () => {
    abrir(painelCom(5, 2));

    expect(await screen.findByText(/Faltam 3 peças\./)).toBeInTheDocument();
    await userEvent.click(await botaoSortear());

    const modal = await screen.findByRole("dialog", { name: "Peça 6 de 8!" });
    expect(modal.querySelectorAll("[data-preenchido='true']")).toHaveLength(6);
    expect(atual().getByText("5 de 8 peças coletadas")).toBeInTheDocument();

    await userEvent.click(within(modal).getByRole("button", { name: "Continuar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(atual().getByRole("img", { name: "6 de 8 peças coletadas" })).toBeInTheDocument();
    expect(
      screen
        .getByRole("region", { name: "Quebra-cabeça atual" })
        .querySelector("[data-nova='true']"),
    ).toHaveAttribute("data-peca", "5");
    expect(within(creditos()).getByText("1")).toBeInTheDocument();
  });

  it("desabilita o sorteio e orienta a ir a um evento quando não há créditos", async () => {
    abrir(painelCom(5, 0));

    expect(
      await screen.findByRole("button", { name: /Vá a um evento para ganhar um crédito/ }),
    ).toBeDisabled();
    expect(screen.getByText(/Você não tem créditos/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver agenda" })).toHaveAttribute("href", "/agenda");
    expect(screen.queryByRole("button", { name: /Sortear nova peça/ })).not.toBeInTheDocument();
  });

  it("revela a imagem completa ao concluir e volta para o dado ao fechar", async () => {
    abrir(painelCom(7, 1));

    await userEvent.click(await botaoSortear());
    const modal = await screen.findByRole("dialog", {
      name: "Parabéns! Você completou o quebra-cabeça!",
    });
    expect(
      within(modal).getByRole("heading", { name: quebraCabecaQuaseCompleto.nome }),
    ).toBeVisible();
    expect(within(modal).getByText(quebraCabecaQuaseCompleto.historia)).toBeInTheDocument();
    expect(within(modal).getByText(quebraCabecaQuaseCompleto.legenda)).toBeInTheDocument();

    await userEvent.click(within(modal).getAllByRole("button", { name: "Fechar" })[1]);
    expect(
      await screen.findByRole("button", { name: "Sortear um novo quebra-cabeça" }),
    ).toBeInTheDocument();
    const catalogo = screen.getByRole("region", { name: "Catálogo de quebra-cabeças" });
    expect(
      within(catalogo).getByRole("button", { name: new RegExp(quebraCabecaQuaseCompleto.nome) }),
    ).toBeInTheDocument();
  });

  it("recarrega o painel e mostra o estado sem créditos quando o crédito acabou em outra aba", async () => {
    const painel = painelCom(5, 1);
    abrir(painel);
    await botaoSortear();
    servidor.use(
      http.post("*/api/gamificacao/sortear-peca", () =>
        HttpResponse.json({ codigo: "SEM_CREDITOS" }, { status: 409 }),
      ),
      http.get("*/api/gamificacao", () => HttpResponse.json({ ...painel, creditos: 0 })),
    );

    await userEvent.click(await botaoSortear());
    expect(
      await screen.findByRole("button", { name: /Vá a um evento para ganhar um crédito/ }),
    ).toBeDisabled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("envia uma única requisição em dois cliques rápidos", async () => {
    abrir(painelCom(5, 2));
    servidor.use(
      http.post("*/api/gamificacao/sortear-peca", async () => {
        await delay(200);
        return HttpResponse.json({
          indice: 5,
          recorte: recorte(5),
          pecas_obtidas: 6,
          creditos: 1,
          concluido: false,
        });
      }),
    );

    const botao = await botaoSortear();
    await userEvent.dblClick(botao);
    expect(botao).toHaveAttribute("aria-busy", "true");
    await screen.findByRole("dialog", { name: "Peça 6 de 8!" });
    expect(sorteios).toBe(1);
  });

  it("avisa quando o sorteio falha por um erro inesperado", async () => {
    abrir(painelCom(5, 2));
    servidor.use(
      http.post("*/api/gamificacao/sortear-peca", () => new HttpResponse(null, { status: 500 })),
    );

    await userEvent.click(await botaoSortear());
    expect(await screen.findByText(MENSAGEM_FALHA_PECA)).toBeInTheDocument();
  });

  it("sincroniza os créditos com as presenças novas ao abrir a página", async () => {
    abrir(painelCom(5, 0));
    servidor.use(http.get("*/api/gamificacao/creditos", () => HttpResponse.json({ saldo: 3 })));

    await waitFor(() => expect(within(creditos()).getByText("3")).toBeInTheDocument());
    expect(await botaoSortear()).toBeEnabled();
  });
});
