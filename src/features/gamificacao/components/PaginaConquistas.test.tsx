import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { Perfil } from "@/shared/sessao/tipos";
import { perfilFiliado, perfilNaoFiliado } from "@/test/fixtures/pessoas";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import {
  detalheTeste,
  handlersGamificacao,
  painelSemAndamento,
  painelTeste,
} from "../mocks/gamificacao.handlers";
import type { PainelGamificacao } from "../tipos/gamificacao";
import { MENSAGEM_NAO_ENCONTRADO } from "./ModalConcluido";
import { PaginaConquistas } from "./PaginaConquistas";

let consultasPainel: number;

beforeEach(() => {
  consultasPainel = 0;
  servidor.events.on("request:start", ({ request }) => {
    if (new URL(request.url).pathname === "/api/gamificacao") consultasPainel += 1;
  });
});

afterEach(() => servidor.events.removeAllListeners());

function abrir(painel: PainelGamificacao = painelTeste, sessao: Perfil = perfilFiliado) {
  const resultado = renderizar(<PaginaConquistas />, { sessao });
  servidor.use(...handlersGamificacao(painel));
  return resultado;
}

const resumo = () => screen.findByRole("region", { name: "Resumo da coleção" });

function pecasReveladas(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll("[data-revelada='true']")).map(
    (peca) => peca.getAttribute("data-peca") ?? "",
  );
}

describe("Painel de quebra-cabeças", () => {
  it("mostra os indicadores de concluídos, peças do atual e créditos", async () => {
    abrir();

    const indicadores = within(await resumo());
    expect(indicadores.getByText("3")).toBeInTheDocument();
    expect(indicadores.getByText("Quebra-cabeças completos")).toBeInTheDocument();
    expect(indicadores.getByText("5")).toBeInTheDocument();
    expect(indicadores.getByText("de 8 peças coletadas no atual")).toBeInTheDocument();
    expect(indicadores.getByText("2")).toBeInTheDocument();
    expect(indicadores.getByText("Créditos disponíveis")).toBeInTheDocument();
  });

  it("monta o tabuleiro com os recortes nas posições dos índices e anuncia o progresso", async () => {
    const { container } = abrir({
      ...painelTeste,
      em_andamento: {
        pecas_obtidas: 3,
        total_pecas: 8,
        pecas: [
          { indice: 0, recorte: "https://exemplo.test/0.png" },
          { indice: 1, recorte: "https://exemplo.test/1.png" },
          { indice: 4, recorte: "https://exemplo.test/4.png" },
        ],
      },
    });

    const atual = await screen.findByRole("region", { name: "Quebra-cabeça atual" });
    expect(within(atual).getByRole("img", { name: "3 de 8 peças coletadas" })).toBeInTheDocument();
    expect(within(atual).getByText("3 de 8 peças coletadas")).toBeInTheDocument();
    expect(pecasReveladas(atual).sort()).toEqual(["0", "1", "4"]);
    expect(atual.querySelectorAll("[data-revelada='false']")).toHaveLength(5);
    expect(atual.querySelector("image")?.getAttribute("href")).toMatch(/exemplo\.test/);
    expect(container.textContent).not.toContain("Fundação do PMI-DF Em andamento");
  });

  it("lista o andamento, os concluídos e um único cartão de quebra-cabeças por descobrir", async () => {
    abrir();

    const catalogo = await screen.findByRole("region", { name: "Catálogo de quebra-cabeças" });
    const itens = within(catalogo).getAllByRole("listitem");
    expect(itens).toHaveLength(5);
    expect(within(itens[0]).getByText("Em andamento")).toBeInTheDocument();
    expect(within(catalogo).getByRole("button", { name: /Diretoria 2023–2024/ })).toHaveTextContent(
      "Completo· 20/11/2025",
    );
    expect(within(catalogo).getAllByText("Mais quebra-cabeças para descobrir")).toHaveLength(1);
  });

  it("abre o detalhe do concluído com a imagem, a legenda e a história", async () => {
    abrir();

    await userEvent.click(await screen.findByRole("button", { name: /Diretoria 2023–2024/ }));
    const modal = await screen.findByRole("dialog", { name: "Diretoria 2023–2024" });
    expect(modal).toHaveAccessibleDescription("Concluído em 20/11/2025");
    expect(within(modal).getByText(detalheTeste.legenda)).toBeInTheDocument();
    expect(await within(modal).findByText(detalheTeste.historia)).toBeInTheDocument();

    await userEvent.click(within(modal).getAllByRole("button", { name: "Fechar" })[1]);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("fecha o modal com aviso quando o concluído não é encontrado", async () => {
    abrir();
    servidor.use(
      http.get("*/api/gamificacao/concluidos/:id", () =>
        HttpResponse.json({ codigo: "QUEBRA_CABECA_NAO_ENCONTRADO" }, { status: 404 }),
      ),
    );

    await userEvent.click(await screen.findByRole("button", { name: /Summit 2025/ }));
    expect(await screen.findByText(MENSAGEM_NAO_ENCONTRADO)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("mostra a falha ao carregar a história sem fechar o modal", async () => {
    abrir();
    servidor.use(
      http.get("*/api/gamificacao/concluidos/:id", () => new HttpResponse(null, { status: 500 })),
    );

    await userEvent.click(await screen.findByRole("button", { name: /Summit 2025/ }));
    const modal = await screen.findByRole("dialog", { name: "Summit 2025" });
    expect(
      await within(modal).findByText(
        "Não foi possível carregar a história deste quebra-cabeça.",
        {},
        { timeout: 3000 },
      ),
    ).toBeInTheDocument();
  });

  it("mostra '—' e o dado no lugar do cartão atual quando não há quebra-cabeça em andamento", async () => {
    abrir(painelSemAndamento);

    const indicadores = within(await resumo());
    expect(indicadores.getByText("—")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sortear um novo quebra-cabeça" })).toBeEnabled();
    expect(screen.queryByRole("img", { name: /peças coletadas/ })).not.toBeInTheDocument();
    expect(screen.queryByText("Em andamento")).not.toBeInTheDocument();
  });
});

describe("Acesso ao painel", () => {
  it("mostra ao Não-Filiado o painel, os indicadores bloqueados, o tabuleiro sob o cadeado e os cartões surpresa", async () => {
    abrir(painelTeste, perfilNaoFiliado);

    expect(
      await screen.findByRole("region", { name: "Você ainda não tem nenhuma peça" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/^Filie-se ao PMI-DF para começar a ganhar créditos/)).toBeVisible();

    const indicadores = within(screen.getByRole("region", { name: "Resumo da coleção" }));
    expect(indicadores.getByText("Quebra-cabeças completos")).toBeInTheDocument();
    expect(indicadores.getByText("Peças coletadas no atual")).toBeInTheDocument();
    expect(indicadores.getAllByText("Disponível para filiados")).toHaveLength(2);

    const bloqueio = screen.getByRole("region", { name: "Conteúdo bloqueado" });
    expect(
      within(bloqueio).getByRole("heading", { name: "Filie-se para começar a colecionar peças" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /peças coletadas/ })).not.toBeInTheDocument();

    const catalogo = screen.getByRole("region", { name: "Catálogo de quebra-cabeças" });
    expect(within(catalogo).getAllByText("Quebra-cabeça surpresa")).toHaveLength(6);
    expect(within(catalogo).queryByRole("button")).not.toBeInTheDocument();
    expect(consultasPainel).toBe(0);
  });

  it("abre a filiação sem registrar conversão", async () => {
    abrir(painelTeste, perfilNaoFiliado);
    const cliques: unknown[] = [];
    servidor.events.on("request:start", ({ request }) => {
      if (new URL(request.url).pathname === "/api/conversao/cta") cliques.push(request.url);
    });

    const links = await screen.findAllByRole("link", { name: /Quero (me filiar|ser filiado)/ });
    expect(links).toHaveLength(3);
    for (const link of links) {
      link.addEventListener("click", (evento) => evento.preventDefault());
      await userEvent.click(link);
    }
    expect(cliques).toEqual([]);
  });

  it("mostra a visão bloqueada quando a API responde que a filiação é necessária", async () => {
    abrir();
    servidor.use(
      http.get("*/api/gamificacao", () =>
        HttpResponse.json({ codigo: "FILIACAO_NECESSARIA" }, { status: 403 }),
      ),
    );

    expect(
      await screen.findByRole("region", { name: "Você ainda não tem nenhuma peça" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Disponível para filiados")).toHaveLength(2);
    expect(screen.queryByText(/peças coletadas no atual/)).not.toBeInTheDocument();
    expect(consultasPainel).toBe(1);
  });

  it("oferece tentar de novo quando o painel falha", async () => {
    abrir();
    let tentativas = 0;
    servidor.use(
      http.get("*/api/gamificacao", () => {
        tentativas += 1;
        return tentativas <= 2
          ? new HttpResponse(null, { status: 500 })
          : HttpResponse.json(painelTeste);
      }),
    );

    await userEvent.click(
      await screen.findByRole("button", { name: "Tentar novamente" }, { timeout: 3000 }),
    );
    expect(await resumo()).toBeInTheDocument();
  });
});
