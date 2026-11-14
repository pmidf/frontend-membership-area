import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { COD_TECNOLOGIA } from "@/features/conteudos/mocks/conteudos.handlers";
import { perfilAdmin } from "@/test/fixtures/pessoas";
import { definirNavegacao } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import {
  conteudoArquivado,
  conteudoRascunho,
  conteudoVideo,
  handlersConteudoAdmin,
} from "../mocks/conteudos-admin.handlers";
import type { ConteudoAdmin } from "../tipos/conteudo-admin";
import { PaginaEditarConteudo } from "./PaginaEditarConteudo";

const ESPERA = 4000;

let usuario: ReturnType<typeof userEvent.setup>;
let chamadas: { metodo: string; caminho: string; corpo: unknown }[];

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
  chamadas = [];
  servidor.events.on("request:start", async ({ request }) => {
    const { pathname } = new URL(request.url);
    if (request.method === "GET" || !pathname.startsWith("/api/admin/conteudos")) return;
    if (pathname.endsWith("/youtube/preview")) return;
    const texto = await request.clone().text();
    chamadas.push({ metodo: request.method, caminho: pathname, corpo: texto && JSON.parse(texto) });
  });
});

afterEach(() => servidor.events.removeAllListeners());

async function abrir(conteudo: ConteudoAdmin = conteudoRascunho, consulta = "") {
  const id = conteudo.id_conteudo;
  definirNavegacao(`/admin/conteudos/${id}`, consulta, { id });
  renderizar(<PaginaEditarConteudo />, { sessao: perfilAdmin });
  servidor.use(...handlersConteudoAdmin(conteudo));
  await screen.findByRole("heading", { level: 1, name: "Edição de conteúdo" }, { timeout: ESPERA });
}

const avisos = () => within(screen.getByRole("region", { name: "Avisos" }));
const botao = (nome: string) => screen.getByRole("button", { name: nome });

async function substituir(rotulo: string, valor: string) {
  const campo = screen.getByLabelText(rotulo);
  await usuario.clear(campo);
  await usuario.type(campo, valor);
}

describe("Edição de conteúdo", { timeout: 15_000 }, () => {
  it("preenche o formulário, trava o tipo e mostra as datas", async () => {
    await abrir(conteudoVideo, "situacao=PUBLICADO");

    expect(screen.getByLabelText("Título")).toHaveValue(conteudoVideo.titulo);
    expect(screen.getByLabelText("Tipo")).toHaveValue("Vídeo do YouTube");
    expect(screen.getByLabelText("Tipo")).toHaveAttribute("readonly");
    expect(screen.getByLabelText("Duração (minutos)")).toHaveValue("42");
    expect(await screen.findByLabelText("Categoria")).toHaveValue(COD_TECNOLOGIA);
    expect(screen.getByText("Criado em")).toBeInTheDocument();
    expect(screen.getByText("Última edição")).toBeInTheDocument();
    expect(await screen.findByText("ID extraído automaticamente: dQw4w9WgXcQ")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar para a biblioteca" })).toHaveAttribute(
      "href",
      "/admin/conteudos?situacao=PUBLICADO",
    );
    expect(screen.getByRole("link", { name: "Ver estatísticas" })).toHaveAttribute(
      "href",
      `/admin/conteudos/${conteudoVideo.id_conteudo}/estatisticas`,
    );
    expect(screen.queryByRole("button", { name: "Publicar conteúdo" })).toBeNull();
  });

  it("envia só o campo alterado e avisa", async () => {
    await abrir(conteudoVideo);
    expect(botao("Salvar alterações")).toBeDisabled();

    await substituir("Descrição", "Nova descrição");
    await usuario.click(botao("Salvar alterações"));

    expect(await avisos().findByText("Conteúdo atualizado")).toBeInTheDocument();
    expect(chamadas).toEqual([
      {
        metodo: "PATCH",
        caminho: `/api/admin/conteudos/${conteudoVideo.id_conteudo}`,
        corpo: { descricao: "Nova descrição" },
      },
    ]);
    await waitFor(() => expect(botao("Salvar alterações")).toBeDisabled());
  });

  it("publica um rascunho salvando antes o que mudou", async () => {
    await abrir();
    expect(screen.queryByRole("link", { name: "Ver estatísticas" })).toBeNull();

    await substituir("Título", "Plano de PDUs");
    await usuario.click(botao("Publicar conteúdo"));

    expect(await avisos().findByText("Conteúdo publicado")).toBeInTheDocument();
    expect(chamadas.map(({ metodo }) => metodo)).toEqual(["PATCH", "POST"]);
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Publicar conteúdo" })).toBeNull(),
    );
    expect(screen.getAllByText("Publicado").length).toBeGreaterThan(0);
  });

  it("arquiva com confirmação e deixa a edição somente leitura", async () => {
    await abrir(conteudoVideo);

    await usuario.click(botao("Arquivar"));
    const dialogo = within(await screen.findByRole("dialog", { name: "Arquivar conteúdo?" }));
    expect(
      dialogo.getByText("O conteúdo sai do catálogo. As estatísticas de acesso são mantidas."),
    ).toBeInTheDocument();
    await usuario.click(dialogo.getByRole("button", { name: "Arquivar" }));

    expect(await avisos().findByText("Conteúdo arquivado")).toBeInTheDocument();
    expect(
      await screen.findByText("Ele saiu do catálogo e não pode mais ser editado."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Salvar alterações" })).toBeNull();
    expect(chamadas).toEqual([
      { metodo: "DELETE", caminho: `/api/admin/conteudos/${conteudoVideo.id_conteudo}`, corpo: "" },
    ]);
  });

  it("abre arquivado como somente leitura", async () => {
    await abrir(conteudoArquivado);

    expect(screen.getByLabelText("Título")).toBeDisabled();
    expect(screen.getByLabelText("Tipo")).toHaveValue("Material / link");
    expect(
      screen.getByText("Ele saiu do catálogo e não pode mais ser editado."),
    ).toBeInTheDocument();
  });

  it("recarrega ao receber 409 por ter sido arquivado", async () => {
    await abrir(conteudoVideo);
    let tentativas = 0;
    servidor.use(
      http.patch("*/api/admin/conteudos/:id", () =>
        HttpResponse.json({ message: "Conteúdo arquivado não pode ser editado" }, { status: 409 }),
      ),
      http.get("*/api/admin/conteudos/:id", () => {
        tentativas += 1;
        return HttpResponse.json({ ...conteudoVideo, situacao: "ARQUIVADO" });
      }),
    );

    await substituir("Título", "Outro título");
    await usuario.click(botao("Salvar alterações"));

    expect(
      await avisos().findByText("Este conteúdo foi arquivado e não pode mais ser editado."),
    ).toBeInTheDocument();
    await waitFor(() => expect(tentativas).toBeGreaterThan(0));
    expect(
      await screen.findByText("Ele saiu do catálogo e não pode mais ser editado."),
    ).toBeInTheDocument();
  });

  it("avisa quando o rascunho já foi publicado em outra aba", async () => {
    await abrir();
    servidor.use(
      http.post("*/api/admin/conteudos/:id/publicar", () =>
        HttpResponse.json(
          { message: "Só conteúdos em rascunho podem ser publicados" },
          { status: 409 },
        ),
      ),
    );

    await usuario.click(botao("Publicar conteúdo"));

    expect(await avisos().findByText("Este conteúdo já não está em rascunho.")).toBeInTheDocument();
  });

  it("mostra no campo o erro de validação do backend", async () => {
    await abrir(conteudoVideo);
    servidor.use(
      http.patch("*/api/admin/conteudos/:id", () =>
        HttpResponse.json(
          { codigo: "DADOS_INVALIDOS", campos: { titulo: ["Título já usado"] } },
          { status: 422 },
        ),
      ),
    );

    await substituir("Título", "Repetido");
    await usuario.click(botao("Salvar alterações"));

    expect(await screen.findByText("Título já usado")).toBeInTheDocument();
  });

  it("avisa erro genérico ao arquivar", async () => {
    await abrir(conteudoVideo);
    servidor.use(
      http.delete("*/api/admin/conteudos/:id", () => HttpResponse.json({}, { status: 500 })),
    );

    await usuario.click(botao("Arquivar"));
    const dialogo = within(await screen.findByRole("dialog", { name: "Arquivar conteúdo?" }));
    await usuario.click(dialogo.getByRole("button", { name: "Arquivar" }));

    expect(
      await avisos().findByText("Não foi possível concluir a ação. Tente novamente."),
    ).toBeInTheDocument();
  });

  it("mostra Conteúdo não encontrado no 404", async () => {
    definirNavegacao("/admin/conteudos/x", "", { id: "60000000-0000-4000-8000-000000000099" });
    renderizar(<PaginaEditarConteudo />, { sessao: perfilAdmin });
    servidor.use(...handlersConteudoAdmin());

    expect(
      await screen.findByText("Conteúdo não encontrado", {}, { timeout: ESPERA }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar para a biblioteca" })).toHaveAttribute(
      "href",
      "/admin/conteudos",
    );
  });

  it("mostra o erro de carregamento e tenta de novo", async () => {
    let falhar = true;
    const id = conteudoVideo.id_conteudo;
    definirNavegacao(`/admin/conteudos/${id}`, "", { id });
    renderizar(<PaginaEditarConteudo />, { sessao: perfilAdmin });
    servidor.use(
      http.get("*/api/admin/conteudos/:id", () =>
        falhar ? HttpResponse.json({}, { status: 500 }) : HttpResponse.json(conteudoVideo),
      ),
      ...handlersConteudoAdmin(conteudoVideo),
    );

    expect(
      await screen.findByText("Não foi possível carregar o conteúdo.", {}, { timeout: ESPERA }),
    ).toBeInTheDocument();
    falhar = false;
    await usuario.click(botao("Tentar novamente"));

    expect(
      await screen.findByRole("heading", { level: 1, name: "Edição de conteúdo" }),
    ).toBeInTheDocument();
  });
});
