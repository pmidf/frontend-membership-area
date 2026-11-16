import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { perfilAdmin } from "@/test/fixtures/pessoas";
import { definirNavegacao } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { handlersGamificacaoAdmin, listaTeste } from "../mocks/gamificacao-admin.handlers";
import { MENSAGEM_IMAGEM_BLOQUEADA } from "./FormularioQuebraCabeca";
import {
  MENSAGEM_FORA_DO_AR,
  MENSAGEM_IMAGEM_SEM_RECORTES,
  PaginaEditarQuebraCabeca,
} from "./PaginaEditarQuebraCabeca";

const [comProgresso, , rascunho, foraDoAr] = [
  listaTeste[1],
  listaTeste[0],
  listaTeste[2],
  listaTeste[3],
];

let edicoes: unknown[];
let publicacoes: string[];

beforeEach(() => {
  edicoes = [];
  publicacoes = [];
  servidor.events.on("request:start", async ({ request }) => {
    const { pathname } = new URL(request.url);
    if (request.method === "PATCH") edicoes.push(await request.clone().json());
    if (pathname.endsWith("/publicar")) publicacoes.push(pathname);
  });
});

afterEach(() => servidor.events.removeAllListeners());

async function abrir(id: string) {
  definirNavegacao(`/admin/quebra-cabecas/${id}`, "", { id });
  renderizar(<PaginaEditarQuebraCabeca />, { sessao: perfilAdmin });
  servidor.use(...handlersGamificacaoAdmin());
}

const titulo = () => screen.findByRole("heading", { name: "Editar quebra-cabeça" });

function preencher(rotulo: string, valor: string) {
  fireEvent.change(screen.getByLabelText(rotulo), { target: { value: valor } });
}

describe("Editar quebra-cabeça", () => {
  it("deixa trocar a imagem e os recortes quando ninguém começou a montar", async () => {
    await abrir(rascunho.id_quebra_cabeca);
    await titulo();

    expect(screen.getByLabelText("URL da imagem completa")).toBeEnabled();
    expect(screen.getByLabelText("URL da peça 1")).toBeEnabled();
    expect(screen.queryByText(MENSAGEM_IMAGEM_BLOQUEADA)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Nome do quebra-cabeça")).toHaveValue("Meetup de Ágeis");
  });

  it("bloqueia a imagem e os recortes quando já há progresso", async () => {
    await abrir(comProgresso.id_quebra_cabeca);
    await titulo();

    expect(screen.getByText(MENSAGEM_IMAGEM_BLOQUEADA)).toBeInTheDocument();
    expect(screen.getByLabelText("URL da imagem completa")).toBeDisabled();
    expect(screen.getByLabelText("URL da peça 8")).toBeDisabled();
    expect(screen.getByLabelText("Legenda curta")).toBeEnabled();
  });

  it("envia só a legenda quando só ela mudou e confirma o salvamento", async () => {
    await abrir(comProgresso.id_quebra_cabeca);
    await titulo();
    preencher("Legenda curta", "Nova legenda");

    await userEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    const modal = await screen.findByRole("dialog", { name: "Alterações salvas com sucesso!" });
    expect(modal).toHaveAccessibleDescription(/A imagem continua a mesma/);
    expect(within(modal).getByRole("link", { name: "Voltar para a lista" })).toHaveAttribute(
      "href",
      "/admin/quebra-cabecas",
    );
    expect(edicoes).toEqual([{ legenda: "Nova legenda" }]);
  });

  it("pede os recortes junto quando só a imagem completa muda", async () => {
    await abrir(rascunho.id_quebra_cabeca);
    await titulo();
    preencher("URL da imagem completa", "https://img.test/nova.jpg");

    await userEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    expect(await screen.findByText(MENSAGEM_IMAGEM_SEM_RECORTES)).toBeInTheDocument();
    expect(edicoes).toEqual([]);
  });

  it("envia a imagem e os 8 recortes juntos quando um recorte muda", async () => {
    await abrir(rascunho.id_quebra_cabeca);
    await titulo();
    preencher("URL da peça 3", "https://img.test/nova-3.png");

    await userEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    await screen.findByRole("dialog", { name: "Alterações salvas com sucesso!" });
    expect(edicoes).toEqual([
      expect.objectContaining({
        imagem_original: "https://img.test/completa.jpg",
        recortes: expect.arrayContaining(["https://img.test/nova-3.png"]),
      }),
    ]);
  });

  it("bloqueia a imagem quando alguém começou a montar entre a abertura e o envio", async () => {
    await abrir(rascunho.id_quebra_cabeca);
    await titulo();
    servidor.use(
      http.patch("*/api/admin/quebra-cabecas/:id", () =>
        HttpResponse.json({ codigo: "IMAGEM_BLOQUEADA" }, { status: 409 }),
      ),
    );
    preencher("URL da peça 3", "https://img.test/nova-3.png");

    await userEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    expect(await screen.findByText(MENSAGEM_IMAGEM_BLOQUEADA)).toBeInTheDocument();
    expect(screen.getByLabelText("URL da peça 3")).toBeDisabled();
    expect(screen.getByLabelText("URL da peça 3")).toHaveValue("https://img.test/peca-2.png");
  });

  it("abre um quebra-cabeça fora do ar somente para leitura", async () => {
    await abrir(foraDoAr.id_quebra_cabeca);
    await titulo();

    expect(screen.getByText(MENSAGEM_FORA_DO_AR)).toBeInTheDocument();
    expect(screen.getByLabelText("Nome do quebra-cabeça")).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Salvar alterações" })).not.toBeInTheDocument();
  });

  it("publica um rascunho a partir da edição", async () => {
    await abrir(rascunho.id_quebra_cabeca);
    await titulo();

    await userEvent.click(screen.getByRole("button", { name: "Publicar" }));
    expect(await screen.findByText(/Quebra-cabeça publicado/)).toBeInTheDocument();
    expect(publicacoes).toHaveLength(1);
    expect(edicoes).toEqual([]);
  });

  it("mostra que o quebra-cabeça não foi encontrado", async () => {
    await abrir("40000000-0000-4000-8000-000000000999");

    expect(await screen.findByText("Quebra-cabeça não encontrado")).toBeInTheDocument();
  });

  it("mostra os erros de campo do backend", async () => {
    await abrir(rascunho.id_quebra_cabeca);
    await titulo();
    servidor.use(
      http.patch("*/api/admin/quebra-cabecas/:id", () =>
        HttpResponse.json(
          { codigo: "DADOS_INVALIDOS", campos: { nome: ["Nome já usado"] } },
          { status: 422 },
        ),
      ),
    );
    preencher("Nome do quebra-cabeça", "Outro nome");

    await userEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));
    await waitFor(() =>
      expect(screen.getByLabelText("Nome do quebra-cabeça")).toHaveAccessibleDescription(
        "Nome já usado",
      ),
    );
  });
});
