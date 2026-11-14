import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { describe, expect, it } from "vitest";

import { perfilAdmin } from "@/test/fixtures/pessoas";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { handlersGamificacaoAdmin, listaTeste } from "../mocks/gamificacao-admin.handlers";
import { MENSAGEM_SITUACAO_MUDOU } from "./AcoesSituacaoQuebraCabeca";
import { PaginaQuebraCabecasAdmin } from "./PaginaQuebraCabecasAdmin";

function abrir(lista = listaTeste) {
  renderizar(<PaginaQuebraCabecasAdmin />, { sessao: perfilAdmin });
  servidor.use(...handlersGamificacaoAdmin(lista));
}

const linha = async (nome: string) =>
  (await screen.findByText(nome)).closest("tr, li, [role='row']") as HTMLElement;

describe("Catálogo de quebra-cabeças do Admin", () => {
  it("mostra status, peças, quem concluiu e quem está montando", async () => {
    abrir();

    const fundacao = within(await linha("Fundação do PMI-DF"));
    expect(fundacao.getByText("Publicado")).toBeInTheDocument();
    expect(fundacao.getByText("12")).toBeInTheDocument();
    expect(fundacao.getByText("3")).toBeInTheDocument();
    expect(within(await linha("Summit 2024")).getByText("Fora do ar")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+ Novo quebra-cabeça" })).toHaveAttribute(
      "href",
      "/admin/quebra-cabecas/novo",
    );
    expect(screen.getByRole("link", { name: /Ver estatísticas/ })).toHaveAttribute(
      "href",
      "/admin/quebra-cabecas/estatisticas",
    );
  });

  it("oferece publicar só ao rascunho e o publica", async () => {
    abrir();

    expect(
      within(await linha("Diretoria 2023–2024")).queryByRole("button", { name: /Publicar/ }),
    ).toBeNull();
    expect(
      within(await linha("Diretoria 2023–2024")).getByRole("link", {
        name: "Editar Diretoria 2023–2024",
      }),
    ).toHaveAttribute("href", `/admin/quebra-cabecas/${listaTeste[0].id_quebra_cabeca}`);

    await userEvent.click(screen.getByRole("button", { name: "Publicar Meetup de Ágeis" }));
    expect(await screen.findByText(/"Meetup de Ágeis" publicado/)).toBeInTheDocument();
    expect(
      await within(await linha("Meetup de Ágeis")).findByText("Publicado"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Publicar/ })).not.toBeInTheDocument();
  });

  it("avisa e recarrega quando a situação mudou antes de publicar", async () => {
    abrir();
    servidor.use(
      http.post("*/api/admin/quebra-cabecas/:id/publicar", () =>
        HttpResponse.json({ codigo: "TRANSICAO_INVALIDA" }, { status: 409 }),
      ),
    );

    await userEvent.click(await screen.findByRole("button", { name: "Publicar Meetup de Ágeis" }));
    expect(await screen.findByText(MENSAGEM_SITUACAO_MUDOU)).toBeInTheDocument();
  });

  it("mostra o estado vazio sem quebra-cabeças", async () => {
    abrir([]);

    expect(await screen.findByText("Nenhum quebra-cabeça cadastrado")).toBeInTheDocument();
  });

  it("oferece tentar de novo quando a lista falha", async () => {
    abrir();
    servidor.use(
      http.get("*/api/admin/quebra-cabecas", () => new HttpResponse(null, { status: 500 })),
    );

    expect(
      await screen.findByRole("button", { name: "Tentar novamente" }, { timeout: 4000 }),
    ).toBeInTheDocument();
  });
});
