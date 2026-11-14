import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { perfilAdmin } from "@/test/fixtures/pessoas";
import { definirNavegacao } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { handlersGamificacaoAdmin, listaTeste } from "../mocks/gamificacao-admin.handlers";
import { MENSAGEM_SITUACAO_MUDOU } from "./AcoesSituacaoQuebraCabeca";
import { MENSAGEM_FORA_DO_AR, PaginaEditarQuebraCabeca } from "./PaginaEditarQuebraCabeca";
import { PaginaQuebraCabecasAdmin } from "./PaginaQuebraCabecasAdmin";

const foraDoAr = listaTeste[3];
let mudancas: string[];

beforeEach(() => {
  mudancas = [];
  servidor.events.on("request:start", ({ request }) => {
    const acao = new URL(request.url).pathname.split("/").at(-1) ?? "";
    if (acao === "tirar-do-ar" || acao === "subir-novamente") mudancas.push(acao);
  });
});

afterEach(() => servidor.events.removeAllListeners());

function abrirLista() {
  renderizar(<PaginaQuebraCabecasAdmin />, { sessao: perfilAdmin });
  servidor.use(...handlersGamificacaoAdmin());
}

const linha = async (nome: string) =>
  within((await screen.findByText(nome)).closest("tr, li, [role='row']") as HTMLElement);

describe("Tirar do ar e subir novamente", () => {
  it("tira um publicado do ar depois de confirmar", async () => {
    abrirLista();

    await userEvent.click(
      (await linha("Fundação do PMI-DF")).getByRole("button", {
        name: "Tirar do ar: Fundação do PMI-DF",
      }),
    );
    const dialogo = within(
      await screen.findByRole("dialog", { name: 'Tirar "Fundação do PMI-DF" do ar?' }),
    );
    expect(dialogo.getByText(/Quem já está montando continua normalmente/)).toBeInTheDocument();
    await userEvent.click(dialogo.getByRole("button", { name: "Tirar do ar" }));

    expect(await screen.findByText("Quebra-cabeça fora do ar")).toBeInTheDocument();
    const fundacao = await linha("Fundação do PMI-DF");
    expect(await fundacao.findByText("Fora do ar")).toBeInTheDocument();
    expect(
      fundacao.getByRole("button", { name: "Subir novamente: Fundação do PMI-DF" }),
    ).toBeInTheDocument();
    expect(mudancas).toEqual(["tirar-do-ar"]);
  });

  it("sobe novamente um quebra-cabeça fora do ar", async () => {
    abrirLista();

    await userEvent.click(
      (await linha("Summit 2024")).getByRole("button", { name: "Subir novamente: Summit 2024" }),
    );
    const dialogo = within(
      await screen.findByRole("dialog", { name: 'Subir "Summit 2024" novamente?' }),
    );
    expect(dialogo.getByText("O quebra-cabeça volta ao sorteio dos filiados.")).toBeInTheDocument();
    await userEvent.click(dialogo.getByRole("button", { name: "Subir novamente" }));

    expect(await screen.findByText("Quebra-cabeça publicado de novo")).toBeInTheDocument();
    expect(await (await linha("Summit 2024")).findByText("Publicado")).toBeInTheDocument();
  });

  it("não envia nada quando a confirmação é cancelada", async () => {
    abrirLista();

    await userEvent.click(
      (await linha("Fundação do PMI-DF")).getByRole("button", {
        name: "Tirar do ar: Fundação do PMI-DF",
      }),
    );
    await userEvent.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: "Cancelar" }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mudancas).toEqual([]);
  });

  it("avisa e recarrega quando a situação mudou", async () => {
    abrirLista();
    servidor.use(
      http.post("*/api/admin/quebra-cabecas/:id/tirar-do-ar", () =>
        HttpResponse.json({ codigo: "TRANSICAO_INVALIDA" }, { status: 409 }),
      ),
    );

    await userEvent.click(
      (await linha("Fundação do PMI-DF")).getByRole("button", {
        name: "Tirar do ar: Fundação do PMI-DF",
      }),
    );
    await userEvent.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: "Tirar do ar" }),
    );

    expect(await screen.findByText(MENSAGEM_SITUACAO_MUDOU)).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("sobe novamente pela edição e libera o formulário", async () => {
    definirNavegacao(`/admin/quebra-cabecas/${foraDoAr.id_quebra_cabeca}`, "", {
      id: foraDoAr.id_quebra_cabeca,
    });
    renderizar(<PaginaEditarQuebraCabeca />, { sessao: perfilAdmin });
    servidor.use(...handlersGamificacaoAdmin());

    expect(await screen.findByText(MENSAGEM_FORA_DO_AR)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Subir novamente: Summit 2024" }));
    await userEvent.click(
      within(await screen.findByRole("dialog")).getByRole("button", { name: "Subir novamente" }),
    );

    expect(await screen.findByRole("button", { name: "Salvar alterações" })).toBeInTheDocument();
    expect(screen.queryByText(MENSAGEM_FORA_DO_AR)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Nome do quebra-cabeça")).toBeEnabled();
  });
});
