import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { perfilAdmin } from "@/test/fixtures/pessoas";
import { definirNavegacao, roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import {
  conteudoArquivado,
  conteudoRascunho,
  conteudoVideo,
  handlersTrilhaAdmin,
  ID_TRILHA_CRIADA,
} from "../mocks/conteudos-admin.handlers";
import { PaginaNovaTrilha } from "./PaginaNovaTrilha";

const ESPERA = 4000;

let usuario: ReturnType<typeof userEvent.setup>;
let chamadas: { metodo: string; caminho: string; corpo: unknown }[];
let buscas: URLSearchParams[];

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
  chamadas = [];
  buscas = [];
  servidor.events.on("request:start", async ({ request }) => {
    const url = new URL(request.url);
    if (request.method === "GET") {
      if (url.pathname === "/api/admin/conteudos") buscas.push(url.searchParams);
      return;
    }
    if (!url.pathname.startsWith("/api/admin/trilhas")) return;
    const texto = await request.clone().text();
    chamadas.push({
      metodo: request.method,
      caminho: url.pathname,
      corpo: texto && JSON.parse(texto),
    });
  });
});

afterEach(() => servidor.events.removeAllListeners());

async function abrir() {
  definirNavegacao("/admin/conteudos/trilhas/novo");
  renderizar(<PaginaNovaTrilha />, { sessao: perfilAdmin });
  servidor.use(...handlersTrilhaAdmin());
  await screen.findByRole("heading", { level: 1, name: "Nova trilha de conhecimento" });
}

const avisos = () => within(screen.getByRole("region", { name: "Avisos" }));
const modal = () => within(screen.getByRole("dialog", { name: "Adicionar conteúdos" }));
const itensDaTrilha = () =>
  within(screen.getByRole("list", { name: "Conteúdos na ordem da trilha" }))
    .getAllByRole("listitem")
    .map((item) => within(item).getAllByText(/./)[1].textContent);

async function preencher() {
  await usuario.type(screen.getByLabelText("Título da trilha"), "Projetos no setor público");
  await usuario.type(screen.getByLabelText("Descrição"), "Do PMBOK 7 ao canvas.");
}

async function adicionar(...titulos: string[]) {
  await usuario.click(screen.getByRole("button", { name: "+ Adicionar conteúdo da biblioteca" }));
  await modal().findByRole("list", { name: "Conteúdos da biblioteca" }, { timeout: ESPERA });
  for (const titulo of titulos) {
    await usuario.click(modal().getByRole("button", { name: `Adicionar ${titulo}` }));
  }
  await usuario.click(modal().getByRole("button", { name: "Concluir" }));
}

describe("Nova trilha", { timeout: 15_000 }, () => {
  it("monta a trilha com a biblioteca, muda a ordem e salva o rascunho", async () => {
    await abrir();
    await preencher();

    await usuario.click(screen.getByRole("button", { name: "+ Adicionar conteúdo da biblioteca" }));
    await modal().findByRole("list", { name: "Conteúdos da biblioteca" }, { timeout: ESPERA });
    expect(modal().queryByText(conteudoArquivado.titulo)).toBeNull();
    await usuario.click(modal().getByRole("button", { name: `Adicionar ${conteudoVideo.titulo}` }));
    await usuario.click(
      modal().getByRole("button", { name: `Adicionar ${conteudoRascunho.titulo}` }),
    );
    expect(modal().getAllByText("Na trilha")).toHaveLength(2);
    expect(modal().getByText("2 conteúdos na trilha")).toBeInTheDocument();
    await usuario.click(modal().getByRole("button", { name: "Concluir" }));

    expect(itensDaTrilha()).toEqual([conteudoVideo.titulo, conteudoRascunho.titulo]);
    expect(screen.getByRole("button", { name: `Subir ${conteudoVideo.titulo}` })).toBeDisabled();
    await usuario.click(screen.getByRole("button", { name: `Subir ${conteudoRascunho.titulo}` }));
    expect(itensDaTrilha()).toEqual([conteudoRascunho.titulo, conteudoVideo.titulo]);
    expect(screen.getByText("Vídeo · Público · Rascunho")).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Salvar rascunho" }));

    await waitFor(() =>
      expect(roteadorFalso.push).toHaveBeenCalledWith(
        `/admin/conteudos/trilhas/${ID_TRILHA_CRIADA}`,
      ),
    );
    expect(chamadas).toEqual([
      {
        metodo: "POST",
        caminho: "/api/admin/trilhas",
        corpo: {
          titulo: "Projetos no setor público",
          descricao: "Do PMBOK 7 ao canvas.",
          ids_conteudos: [conteudoRascunho.id_conteudo, conteudoVideo.id_conteudo],
        },
      },
    ]);
    expect(avisos().getByText("Rascunho salvo")).toBeInTheDocument();
  });

  it("busca e filtra por tipo no seletor e pagina a biblioteca", async () => {
    await abrir();
    await usuario.click(screen.getByRole("button", { name: "+ Adicionar conteúdo da biblioteca" }));
    await modal().findByRole("list", { name: "Conteúdos da biblioteca" }, { timeout: ESPERA });

    await usuario.click(modal().getByRole("button", { name: "Próxima" }));
    await waitFor(() => expect(buscas.at(-1)?.get("page")).toBe("2"));

    await usuario.click(modal().getByRole("button", { name: "Materiais" }));
    await waitFor(() => expect(buscas.at(-1)?.get("tipo")).toBe("MATERIAL"));
    expect(buscas.at(-1)?.get("page")).toBe("1");
    expect(
      await modal().findByText("Nenhum conteúdo encontrado", {}, { timeout: ESPERA }),
    ).toBeInTheDocument();

    await usuario.click(modal().getByRole("button", { name: "Tudo" }));
    await usuario.type(modal().getByLabelText("Buscar na biblioteca"), "Conteúdo 07");
    await waitFor(() => expect(buscas.at(-1)?.get("q")).toBe("Conteúdo 07"), { timeout: ESPERA });
    expect(await modal().findByText("Conteúdo 07")).toBeInTheDocument();
    expect(buscas.at(-1)?.has("tipo")).toBe(false);
  });

  it("remove um conteúdo da trilha", async () => {
    await abrir();
    await adicionar(conteudoVideo.titulo, conteudoRascunho.titulo);

    await usuario.click(screen.getByRole("button", { name: `Remover ${conteudoVideo.titulo}` }));

    expect(itensDaTrilha()).toEqual([conteudoRascunho.titulo]);
  });

  it("exige título e descrição antes de salvar", async () => {
    await abrir();

    await usuario.click(screen.getByRole("button", { name: "Salvar rascunho" }));

    expect(await screen.findByText("Informe o título")).toBeInTheDocument();
    expect(screen.getByText("Informe a descrição")).toBeInTheDocument();
    expect(screen.getByText("Nenhum conteúdo na trilha ainda.")).toBeInTheDocument();
    expect(chamadas).toEqual([]);
  });

  it("não publica sem nenhum conteúdo publicado", async () => {
    await abrir();
    await preencher();
    await adicionar(conteudoRascunho.titulo);

    await usuario.click(screen.getByRole("button", { name: "Publicar trilha" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "A trilha precisa de ao menos um conteúdo publicado",
    );
    expect(chamadas).toEqual([]);

    await adicionar(conteudoVideo.titulo);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("cria e publica, depois volta para a aba de trilhas", async () => {
    await abrir();
    await preencher();
    await adicionar(conteudoVideo.titulo);

    await usuario.click(screen.getByRole("button", { name: "Publicar trilha" }));

    await waitFor(() =>
      expect(roteadorFalso.push).toHaveBeenCalledWith("/admin/conteudos?aba=trilhas"),
    );
    expect(chamadas.map(({ metodo, caminho }) => `${metodo} ${caminho}`)).toEqual([
      "POST /api/admin/trilhas",
      `POST /api/admin/trilhas/${ID_TRILHA_CRIADA}/publicar`,
    ]);
    expect(avisos().getByText("Trilha publicada")).toBeInTheDocument();
  });

  it("leva para a edição quando cria mas não consegue publicar", async () => {
    await abrir();
    await preencher();
    await adicionar(conteudoVideo.titulo);
    servidor.use(
      http.post("*/api/admin/trilhas/:id/publicar", () => HttpResponse.json({}, { status: 500 })),
    );

    await usuario.click(screen.getByRole("button", { name: "Publicar trilha" }));

    await waitFor(() =>
      expect(roteadorFalso.push).toHaveBeenCalledWith(
        `/admin/conteudos/trilhas/${ID_TRILHA_CRIADA}`,
      ),
    );
    expect(avisos().getByText(/O rascunho foi salvo, mas não foi possível publicar/)).toBeVisible();
  });

  it("mostra no título o erro de validação do backend", async () => {
    await abrir();
    await preencher();
    servidor.use(
      http.post("*/api/admin/trilhas", () =>
        HttpResponse.json(
          { statusCode: 422, codigo: "DADOS_INVALIDOS", campos: { titulo: ["Título inválido"] } },
          { status: 422 },
        ),
      ),
    );

    await usuario.click(screen.getByRole("button", { name: "Salvar rascunho" }));

    expect(await screen.findByText("Título inválido")).toBeInTheDocument();
    expect(roteadorFalso.push).not.toHaveBeenCalled();
  });
});
