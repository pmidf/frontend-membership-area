import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { perfilAdmin } from "@/test/fixtures/pessoas";
import { roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { handlersGamificacaoAdmin } from "../mocks/gamificacao-admin.handlers";
import { PaginaNovoQuebraCabeca } from "./PaginaNovoQuebraCabeca";

let chamadas: { caminho: string; corpo: unknown }[];

beforeEach(() => {
  chamadas = [];
  servidor.events.on("request:start", async ({ request }) => {
    if (request.method !== "POST") return;
    if (!new URL(request.url).pathname.startsWith("/api/admin")) return;
    const texto = await request.clone().text();
    chamadas.push({
      caminho: new URL(request.url).pathname,
      corpo: texto ? JSON.parse(texto) : undefined,
    });
  });
});

afterEach(() => servidor.events.removeAllListeners());

function abrir() {
  renderizar(<PaginaNovoQuebraCabeca />, { sessao: perfilAdmin });
  servidor.use(...handlersGamificacaoAdmin());
}

const peca = (indice: number) => `https://img.test/peca-${indice}.png`;

function preencher(campo: string, valor: string) {
  fireEvent.change(screen.getByLabelText(campo), { target: { value: valor } });
}

function preencherBasico() {
  preencher("Nome do quebra-cabeça", "Fundação do PMI-DF");
  preencher("Legenda curta", "Onde tudo começou");
  preencher("História por trás da imagem", "A reunião que deu origem ao capítulo.");
  preencher("URL da imagem completa", "https://img.test/fundacao.jpg");
}

function preencherRecortes(quantidade = 8) {
  for (let indice = 0; indice < quantidade; indice += 1) {
    preencher(`URL da peça ${indice + 1}`, peca(indice));
  }
}

const grade = () => within(screen.getByRole("list", { name: "Pré-visualização da grade 2×4" }));

describe("Novo quebra-cabeça", () => {
  it("mostra o erro no grupo das peças quando falta um recorte", async () => {
    abrir();
    preencherBasico();
    preencherRecortes(7);

    await userEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));
    expect(await screen.findByText("Confira as 8 peças destacadas.")).toBeInTheDocument();
    expect(screen.getByLabelText("URL da peça 8")).toHaveAccessibleDescription(
      "Informe a URL desta peça",
    );
    expect(chamadas).toEqual([]);
  });

  it("monta a grade de pré-visualização na ordem das peças", () => {
    abrir();
    preencher("URL da peça 1", peca(0));
    preencher("URL da peça 6", peca(5));

    expect(grade().getByRole("img", { name: "Peça 1" })).toHaveAttribute("src", peca(0));
    expect(grade().getByRole("img", { name: "Peça 6" })).toHaveAttribute("src", peca(5));
    expect(grade().getByLabelText("Peça 2 sem imagem")).toBeInTheDocument();
    expect(grade().getAllByRole("listitem")).toHaveLength(8);
  });

  it("salva como rascunho e volta para a lista", async () => {
    abrir();
    preencherBasico();
    preencherRecortes();

    await userEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));
    await waitFor(() => expect(roteadorFalso.push).toHaveBeenCalledWith("/admin/quebra-cabecas"));
    expect(chamadas).toEqual([
      {
        caminho: "/api/admin/quebra-cabecas",
        corpo: {
          nome: "Fundação do PMI-DF",
          legenda: "Onde tudo começou",
          historia: "A reunião que deu origem ao capítulo.",
          imagem_original: "https://img.test/fundacao.jpg",
          recortes: Array.from({ length: 8 }, (_, indice) => peca(indice)),
        },
      },
    ]);
    expect(screen.getByText("Rascunho salvo.")).toBeInTheDocument();
  });

  it("adiciona ao catálogo criando e publicando", async () => {
    abrir();
    preencherBasico();
    preencherRecortes();

    await userEvent.click(screen.getByRole("button", { name: "Adicionar ao catálogo" }));
    await waitFor(() => expect(roteadorFalso.push).toHaveBeenCalledWith("/admin/quebra-cabecas"));
    expect(chamadas.map(({ caminho }) => caminho)).toEqual([
      "/api/admin/quebra-cabecas",
      expect.stringMatching(/\/api\/admin\/quebra-cabecas\/.+\/publicar$/),
    ]);
    expect(screen.getByText("Quebra-cabeça adicionado ao catálogo.")).toBeInTheDocument();
  });

  it("avisa quando cria o rascunho mas não consegue publicar", async () => {
    abrir();
    servidor.use(
      http.post("*/api/admin/quebra-cabecas/:id/publicar", () =>
        HttpResponse.json({ codigo: "TRANSICAO_INVALIDA" }, { status: 409 }),
      ),
    );
    preencherBasico();
    preencherRecortes();

    await userEvent.click(screen.getByRole("button", { name: "Adicionar ao catálogo" }));
    expect(await screen.findByText(/O rascunho foi salvo, mas a situação mudou/)).toBeVisible();
    expect(roteadorFalso.push).toHaveBeenCalledWith("/admin/quebra-cabecas");
  });

  it("mostra os erros de campo devolvidos pelo backend, incluindo o grupo das peças", async () => {
    abrir();
    servidor.use(
      http.post("*/api/admin/quebra-cabecas", () =>
        HttpResponse.json(
          {
            codigo: "DADOS_INVALIDOS",
            campos: {
              recortes: ["Informe exatamente 8 recortes"],
              legenda: ["A legenda já existe"],
            },
          },
          { status: 422 },
        ),
      ),
    );
    preencherBasico();
    preencherRecortes();

    await userEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));
    expect(await screen.findByText("Informe exatamente 8 recortes")).toBeInTheDocument();
    expect(screen.getByLabelText("Legenda curta")).toHaveAccessibleDescription(
      expect.stringContaining("A legenda já existe"),
    );
    expect(roteadorFalso.push).not.toHaveBeenCalled();
  });

  it("pré-visualiza o cartão surpresa, o tabuleiro de exemplo e o resultado final", async () => {
    abrir();
    preencherBasico();
    preencherRecortes();

    await userEvent.click(screen.getByRole("button", { name: "🔍 Pré-visualizar" }));
    const modal = within(await screen.findByRole("dialog", { name: "Pré-visualização" }));
    expect(modal.getByText("Quebra-cabeça surpresa")).toBeInTheDocument();
    expect(modal.getByRole("img", { name: "3 de 8 peças coletadas" })).toBeInTheDocument();
    expect(modal.getByText("Fundação do PMI-DF")).toBeInTheDocument();
    expect(modal.getByText("A reunião que deu origem ao capítulo.")).toBeInTheDocument();

    await userEvent.click(modal.getByRole("button", { name: "Voltar a editar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("mostra o contador da legenda", () => {
    abrir();
    preencher("Legenda curta", "Onde tudo começou");

    expect(screen.getByText(/17 de 60 caracteres/)).toBeInTheDocument();
  });
});
