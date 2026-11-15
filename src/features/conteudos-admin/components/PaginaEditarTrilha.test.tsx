import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { perfilAdmin } from "@/test/fixtures/pessoas";
import { definirNavegacao } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import {
  conteudoRascunho,
  conteudoVideo,
  ERRO_TRILHA_SEM_PUBLICADO,
  handlersTrilhaAdmin,
  trilhaArquivada,
  trilhaPublicada,
  trilhaRascunho,
  trilhaSemPublicado,
} from "../mocks/conteudos-admin.handlers";
import type { TrilhaAdmin } from "../tipos/trilha-admin";
import { PaginaEditarTrilha } from "./PaginaEditarTrilha";

const ESPERA = 4000;

let usuario: ReturnType<typeof userEvent.setup>;
let chamadas: { metodo: string; caminho: string; corpo: unknown }[];

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
  chamadas = [];
  servidor.events.on("request:start", async ({ request }) => {
    const { pathname } = new URL(request.url);
    if (request.method === "GET" || !pathname.startsWith("/api/admin/trilhas")) return;
    const texto = await request.clone().text();
    chamadas.push({ metodo: request.method, caminho: pathname, corpo: texto && JSON.parse(texto) });
  });
});

afterEach(() => servidor.events.removeAllListeners());

async function abrir(trilha: TrilhaAdmin = trilhaRascunho, consulta = "") {
  const id = trilha.id_trilha;
  definirNavegacao(`/admin/conteudos/trilhas/${id}`, consulta, { id });
  renderizar(<PaginaEditarTrilha />, { sessao: perfilAdmin });
  servidor.use(...handlersTrilhaAdmin(trilha));
  await screen.findByRole("heading", { level: 1, name: "Edição de trilha" }, { timeout: ESPERA });
}

const avisos = () => within(screen.getByRole("region", { name: "Avisos" }));
const botao = (nome: string) => screen.getByRole("button", { name: nome });
const caminho = (trilha: TrilhaAdmin) => `/api/admin/trilhas/${trilha.id_trilha}`;

describe("Edição de trilha", { timeout: 15_000 }, () => {
  it("preenche o formulário, a prévia e o cartão de publicação", async () => {
    await abrir();

    expect(screen.getByLabelText("Título da trilha")).toHaveValue(trilhaRascunho.titulo);
    expect(screen.getByLabelText("Descrição")).toHaveValue(trilhaRascunho.descricao);
    const lista = within(screen.getByRole("list", { name: "Conteúdos na ordem da trilha" }));
    expect(lista.getAllByRole("listitem")).toHaveLength(2);
    expect(lista.getByText("Vídeo · Exclusivo para filiados")).toBeInTheDocument();
    expect(screen.getByText("Itens na trilha")).toBeInTheDocument();
    expect(screen.getByText("Criada em")).toBeInTheDocument();
    const previa = within(screen.getByRole("list", { name: "Prévia dos conteúdos" }));
    expect(previa.getAllByRole("listitem")).toHaveLength(1);
    expect(
      screen.getByText("1 conteúdo em rascunho fica oculto até ser publicado."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar para as trilhas" })).toHaveAttribute(
      "href",
      "/admin/conteudos?aba=trilhas",
    );
    expect(botao("Salvar alterações")).toBeDisabled();
  });

  it("volta para a lista de trilhas com os filtros de origem", async () => {
    await abrir(trilhaRascunho, "aba=trilhas&situacao=RASCUNHO&pagina=2");

    expect(screen.getByRole("link", { name: "Voltar para as trilhas" })).toHaveAttribute(
      "href",
      "/admin/conteudos?aba=trilhas&situacao=RASCUNHO&pagina=2",
    );
  });

  it("envia só a nova ordem quando os itens mudam de lugar", async () => {
    await abrir();

    await usuario.click(botao(`Descer ${conteudoVideo.titulo}`));
    await usuario.click(botao("Salvar alterações"));

    expect(await avisos().findByText("Trilha atualizada")).toBeInTheDocument();
    expect(chamadas).toEqual([
      {
        metodo: "PATCH",
        caminho: caminho(trilhaRascunho),
        corpo: { ids_conteudos: [conteudoRascunho.id_conteudo, conteudoVideo.id_conteudo] },
      },
    ]);
    expect(botao("Salvar alterações")).toBeDisabled();
  });

  it("envia só o título quando ele muda", async () => {
    await abrir();

    await usuario.clear(screen.getByLabelText("Título da trilha"));
    await usuario.type(screen.getByLabelText("Título da trilha"), "Riscos no setor público");
    await usuario.click(botao("Salvar alterações"));

    await avisos().findByText("Trilha atualizada");
    expect(chamadas[0].corpo).toEqual({ titulo: "Riscos no setor público" });
  });

  it("publica o rascunho e passa a mostrar a trilha como publicada", async () => {
    await abrir();

    await usuario.click(botao("Publicar trilha"));

    expect(await avisos().findByText("Trilha publicada")).toBeInTheDocument();
    expect(chamadas.map(({ metodo, caminho: rota }) => `${metodo} ${rota}`)).toEqual([
      `POST ${caminho(trilhaRascunho)}/publicar`,
    ]);
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Publicar trilha" })).toBeNull(),
    );
  });

  it("não publica uma trilha sem conteúdo publicado", async () => {
    await abrir(trilhaSemPublicado);

    await usuario.click(botao("Publicar trilha"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "A trilha precisa de ao menos um conteúdo publicado",
    );
    expect(chamadas).toEqual([]);
  });

  it("mostra na lista o erro de publicação vindo do backend", async () => {
    await abrir();
    servidor.use(
      http.post("*/api/admin/trilhas/:id/publicar", () =>
        HttpResponse.json(ERRO_TRILHA_SEM_PUBLICADO, { status: 422 }),
      ),
    );

    await usuario.click(botao("Publicar trilha"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "A trilha precisa de ao menos um conteúdo publicado",
    );
  });

  it("arquiva depois de confirmar e deixa a trilha só para leitura", async () => {
    await abrir(trilhaPublicada);

    await usuario.click(botao("Arquivar"));
    const dialogo = within(await screen.findByRole("dialog", { name: "Arquivar trilha?" }));
    await usuario.click(dialogo.getByRole("button", { name: "Arquivar" }));

    expect(await avisos().findByText("Trilha arquivada")).toBeInTheDocument();
    expect(chamadas).toEqual([{ metodo: "DELETE", caminho: caminho(trilhaPublicada), corpo: "" }]);
    expect(
      await screen.findByText("Ela saiu do catálogo e não pode mais ser editada."),
    ).toBeVisible();
  });

  it("bloqueia a edição de trilha arquivada", async () => {
    await abrir(trilhaArquivada);

    expect(screen.getByLabelText("Título da trilha")).toBeDisabled();
    expect(botao("+ Adicionar conteúdo da biblioteca")).toBeDisabled();
    expect(botao(`Remover ${conteudoVideo.titulo}`)).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Salvar alterações" })).toBeNull();
  });

  it("avisa e recarrega quando a trilha foi arquivada por outra pessoa", async () => {
    await abrir();
    servidor.use(
      http.patch("*/api/admin/trilhas/:id", () =>
        HttpResponse.json({ statusCode: 409 }, { status: 409 }),
      ),
    );

    await usuario.type(screen.getByLabelText("Descrição"), " Atualizada.");
    await usuario.click(botao("Salvar alterações"));

    expect(
      await avisos().findByText("Esta trilha foi arquivada e não pode mais ser editada."),
    ).toBeInTheDocument();
  });

  it("mostra quando a trilha não existe", async () => {
    definirNavegacao("/admin/conteudos/trilhas/x", "", { id: "inexistente" });
    renderizar(<PaginaEditarTrilha />, { sessao: perfilAdmin });
    servidor.use(...handlersTrilhaAdmin());

    expect(
      await screen.findByText("Trilha não encontrada", {}, { timeout: ESPERA }),
    ).toBeInTheDocument();
  });

  it("oferece tentar de novo quando a API falha", async () => {
    definirNavegacao(`/admin/conteudos/trilhas/${trilhaRascunho.id_trilha}`, "", {
      id: trilhaRascunho.id_trilha,
    });
    renderizar(<PaginaEditarTrilha />, { sessao: perfilAdmin });
    servidor.use(http.get("*/api/admin/trilhas/:id", () => HttpResponse.json({}, { status: 500 })));

    expect(
      await screen.findByText("Não foi possível carregar a trilha.", {}, { timeout: ESPERA }),
    ).toBeInTheDocument();
    servidor.use(...handlersTrilhaAdmin());
    await usuario.click(botao("Tentar novamente"));

    await screen.findByRole("heading", { level: 1, name: "Edição de trilha" });
  });
});

describe("Despublicar trilha", { timeout: 15_000 }, () => {
  it("confirma e volta a trilha para rascunho", async () => {
    await abrir(trilhaPublicada);

    await usuario.click(botao("Despublicar"));
    const dialogo = within(await screen.findByRole("dialog", { name: "Despublicar trilha?" }));
    await usuario.click(dialogo.getByRole("button", { name: "Despublicar" }));

    expect(await avisos().findByText("Trilha despublicada")).toBeInTheDocument();
    expect(chamadas).toEqual([
      { metodo: "POST", caminho: `${caminho(trilhaPublicada)}/despublicar`, corpo: "" },
    ]);
    expect(await screen.findByRole("button", { name: "Publicar trilha" })).toBeInTheDocument();
  });

  it("salva a nova ordem antes de despublicar", async () => {
    await abrir(trilhaPublicada);
    await usuario.click(botao(`Descer ${conteudoVideo.titulo}`));

    await usuario.click(botao("Despublicar"));
    const dialogo = within(await screen.findByRole("dialog", { name: "Despublicar trilha?" }));
    expect(dialogo.getByText(/serão salvas antes/)).toBeInTheDocument();
    await usuario.click(dialogo.getByRole("button", { name: "Despublicar" }));

    await avisos().findByText("Trilha despublicada");
    expect(chamadas.map(({ metodo, caminho: rota }) => `${metodo} ${rota}`)).toEqual([
      `PATCH ${caminho(trilhaPublicada)}`,
      `POST ${caminho(trilhaPublicada)}/despublicar`,
    ]);
  });

  it("avisa quando a trilha já não está publicada", async () => {
    await abrir(trilhaPublicada);
    servidor.use(
      http.post("*/api/admin/trilhas/:id/despublicar", () =>
        HttpResponse.json({ statusCode: 409 }, { status: 409 }),
      ),
    );

    await usuario.click(botao("Despublicar"));
    const dialogo = within(await screen.findByRole("dialog", { name: "Despublicar trilha?" }));
    await usuario.click(dialogo.getByRole("button", { name: "Despublicar" }));

    expect(await avisos().findByText("Esta trilha já não está publicada.")).toBeInTheDocument();
  });

  it("não oferece despublicar para rascunho", async () => {
    await abrir(trilhaRascunho);

    expect(screen.queryByRole("button", { name: "Despublicar" })).toBeNull();
  });
});
