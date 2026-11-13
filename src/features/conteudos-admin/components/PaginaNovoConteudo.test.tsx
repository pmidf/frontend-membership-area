import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { COD_TECNOLOGIA } from "@/features/conteudos/mocks/conteudos.handlers";
import { perfilAdmin } from "@/test/fixtures/pessoas";
import { definirNavegacao, roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { handlersConteudoAdmin } from "../mocks/conteudos-admin.handlers";
import { PaginaNovoConteudo } from "./PaginaNovoConteudo";

const ID_CRIADO = "60000000-0000-4000-8000-000000000090";
const ESPERA = 4000;

let usuario: ReturnType<typeof userEvent.setup>;
let chamadas: { metodo: string; caminho: string; corpo: unknown }[];

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
  chamadas = [];
  servidor.events.on("request:start", async ({ request }) => {
    if (request.method === "GET") return;
    const { pathname } = new URL(request.url);
    if (!pathname.startsWith("/api/admin/conteudos")) return;
    const texto = await request.clone().text();
    chamadas.push({ metodo: request.method, caminho: pathname, corpo: texto && JSON.parse(texto) });
  });
});

afterEach(() => servidor.events.removeAllListeners());

async function abrir() {
  definirNavegacao("/admin/conteudos/novo");
  renderizar(<PaginaNovoConteudo />, { sessao: perfilAdmin });
  servidor.use(...handlersConteudoAdmin());
  await screen.findByRole("heading", { level: 1, name: "Novo conteúdo" });
  await screen.findByRole("option", { name: "Tecnologia" }, { timeout: ESPERA });
}

const avisos = () => within(screen.getByRole("region", { name: "Avisos" }));

async function preencher({ url = "https://youtu.be/dQw4w9WgXcQ", minutos = "45" } = {}) {
  await usuario.type(screen.getByLabelText("Título"), "Gestão de riscos em contratos públicos");
  await usuario.type(screen.getByLabelText("URL"), url);
  await usuario.type(screen.getByLabelText("Descrição"), "Painel do encontro de novembro.");
  await usuario.selectOptions(screen.getByLabelText("Categoria"), COD_TECNOLOGIA);
  if (minutos) await usuario.type(screen.getByLabelText("Duração (minutos)"), minutos);
}

describe("Novo conteúdo", { timeout: 15_000 }, () => {
  it("mostra o ID e a prévia do vídeo ao sair do campo URL", async () => {
    await abrir();

    await usuario.type(screen.getByLabelText("URL"), "https://youtu.be/dQw4w9WgXcQ");
    await usuario.tab();

    expect(await screen.findByText("ID extraído automaticamente: dQw4w9WgXcQ")).toBeInTheDocument();
    expect(screen.getByTitle("Prévia do vídeo")).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
  });

  it("mostra no campo o erro de URL que não é do YouTube", async () => {
    await abrir();

    await usuario.type(screen.getByLabelText("URL"), "https://exemplo.test/video");
    await usuario.tab();

    expect(await screen.findByText(/URL do YouTube inválida/)).toBeInTheDocument();
    expect(screen.queryByTitle("Prévia do vídeo")).toBeNull();
  });

  it("para material, esconde a duração e não pede prévia", async () => {
    await abrir();

    await usuario.selectOptions(screen.getByLabelText("Tipo"), "MATERIAL");
    await usuario.type(screen.getByLabelText("URL"), "https://exemplo.test/canvas.pdf");
    await usuario.tab();

    expect(screen.queryByLabelText("Duração (minutos)")).toBeNull();
    expect(screen.getByText("Link do material ou da página do PMI Global.")).toBeInTheDocument();
    expect(chamadas.filter(({ caminho }) => caminho.endsWith("/preview"))).toHaveLength(0);
  });

  it("avisa sobre vídeo não listado só quando o vídeo é exclusivo", async () => {
    await abrir();
    const aviso = "Vídeo exclusivo precisa estar como não listado";
    expect(screen.getByText(aviso)).toBeInTheDocument();

    await usuario.selectOptions(screen.getByLabelText("Nível de acesso"), "PUBLICO");

    expect(screen.queryByText(aviso)).toBeNull();
  });

  it("valida os campos obrigatórios antes de enviar", async () => {
    await abrir();

    await usuario.click(screen.getByRole("button", { name: "Salvar rascunho" }));

    expect(await screen.findByText("Informe o título")).toBeInTheDocument();
    expect(screen.getByText("Informe a URL")).toBeInTheDocument();
    expect(screen.getByText("Informe a descrição")).toBeInTheDocument();
    expect(screen.getByText("Selecione a categoria")).toBeInTheDocument();
    expect(chamadas).toHaveLength(0);
  });

  it("recusa duração que não é um número inteiro", async () => {
    await abrir();
    await preencher({ minutos: "1,5" });

    await usuario.click(screen.getByRole("button", { name: "Salvar rascunho" }));

    expect(
      await screen.findByText("Informe os minutos como um número inteiro a partir de 1"),
    ).toBeInTheDocument();
  });

  it("salva o rascunho em segundos e leva para a edição", async () => {
    await abrir();
    await preencher();

    await usuario.click(screen.getByRole("button", { name: "Salvar rascunho" }));

    await waitFor(() =>
      expect(roteadorFalso.push).toHaveBeenCalledWith(`/admin/conteudos/${ID_CRIADO}`),
    );
    expect(avisos().getByText("Rascunho salvo")).toBeInTheDocument();
    const criacao = chamadas.find(({ caminho }) => caminho === "/api/admin/conteudos");
    expect(criacao?.corpo).toEqual({
      titulo: "Gestão de riscos em contratos públicos",
      tipo: "VIDEO",
      url: "https://youtu.be/dQw4w9WgXcQ",
      descricao: "Painel do encontro de novembro.",
      cod_categoria: COD_TECNOLOGIA,
      bol_exclusivo: true,
      duracao_segundos: 2700,
    });
  });

  it("publica em duas chamadas e volta para a biblioteca", async () => {
    await abrir();
    await preencher({ minutos: "" });

    await usuario.click(screen.getByRole("button", { name: "Publicar conteúdo" }));

    await waitFor(() => expect(roteadorFalso.push).toHaveBeenCalledWith("/admin/conteudos"));
    expect(avisos().getByText("Conteúdo publicado")).toBeInTheDocument();
    expect(chamadas.map(({ caminho }) => caminho)).toEqual(
      expect.arrayContaining([
        "/api/admin/conteudos",
        `/api/admin/conteudos/${ID_CRIADO}/publicar`,
      ]),
    );
    expect(chamadas[0].corpo).not.toHaveProperty("duracao_segundos");
  });

  it("leva para a edição quando cria mas não consegue publicar", async () => {
    await abrir();
    servidor.use(
      http.post("*/api/admin/conteudos/:id/publicar", () => HttpResponse.json({}, { status: 500 })),
    );
    await preencher();

    await usuario.click(screen.getByRole("button", { name: "Publicar conteúdo" }));

    await waitFor(() =>
      expect(roteadorFalso.push).toHaveBeenCalledWith(`/admin/conteudos/${ID_CRIADO}`),
    );
    expect(
      avisos().getByText(/o rascunho foi salvo, mas não foi possível publicar/i),
    ).toBeInTheDocument();
  });

  it("mostra no campo o erro devolvido pelo backend", async () => {
    await abrir();
    servidor.use(
      http.post("*/api/admin/conteudos", () =>
        HttpResponse.json(
          { codigo: "DADOS_INVALIDOS", campos: { cod_categoria: ["Categoria não encontrada"] } },
          { status: 422 },
        ),
      ),
    );
    await preencher();

    await usuario.click(screen.getByRole("button", { name: "Salvar rascunho" }));

    expect(await screen.findByText("Categoria não encontrada")).toBeInTheDocument();
    expect(roteadorFalso.push).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Salvar rascunho" })).toBeEnabled();
  });

  it("avisa erro genérico ao criar", async () => {
    await abrir();
    servidor.use(http.post("*/api/admin/conteudos", () => HttpResponse.json({}, { status: 500 })));
    await preencher();

    await usuario.click(screen.getByRole("button", { name: "Salvar rascunho" }));

    expect(
      await avisos().findByText("Não foi possível concluir a ação. Tente novamente."),
    ).toBeInTheDocument();
  });
});
