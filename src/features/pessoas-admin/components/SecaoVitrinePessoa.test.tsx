import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { chavesProfissionais } from "@/features/profissionais/api/profissionais.queries";
import { perfilAdmin } from "@/test/fixtures/pessoas";
import { definirNavegacao } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import type { PessoaDetalheAdmin } from "../api/pessoas-admin.api";
import {
  handlersDetalhePessoa,
  pessoaDetalheTeste,
  pessoaNaVitrine,
  pessoaOcultaNaVitrine,
} from "../mocks/pessoas-admin.handlers";
import { PaginaDetalhePessoa } from "./PaginaDetalhePessoa";

const ROTA_OCULTAR = "*/api/admin/pessoas/:id/vitrine/ocultar";
const CHAVE_VITRINE = chavesProfissionais.lista({});

let usuario: ReturnType<typeof userEvent.setup>;
let requisicoes: { metodo: string; corpo: unknown }[];

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
  requisicoes = [];
  servidor.events.on("request:start", async ({ request }) => {
    if (!request.url.includes("/vitrine/ocultar")) return;
    const texto = await request.clone().text();
    requisicoes.push({ metodo: request.method, corpo: texto ? JSON.parse(texto) : undefined });
  });
});

afterEach(() => servidor.events.removeAllListeners());

function abrir(pessoa: PessoaDetalheAdmin) {
  definirNavegacao(`/admin/pessoas/${pessoa.id_pessoa}`, "", { id: pessoa.id_pessoa });
  const { clienteConsultas } = renderizar(<PaginaDetalhePessoa />, { sessao: perfilAdmin });
  clienteConsultas.setQueryData(CHAVE_VITRINE, {
    total: 0,
    pagina: 1,
    total_paginas: 0,
    itens: [],
  });
  servidor.use(...handlersDetalhePessoa(pessoa));
  return clienteConsultas;
}

async function secao() {
  return within(
    await screen.findByRole("region", { name: "Vitrine — Profissionais da comunidade" }),
  );
}

describe("Vitrine no detalhe da pessoa", () => {
  it("explica, sem ação, quando a pessoa não aparece na vitrine", async () => {
    abrir(pessoaDetalheTeste);

    const vitrine = await secao();
    expect(
      vitrine.getByText(
        "Não aparece na vitrine (a pessoa não ativou a exibição ou não é filiada).",
      ),
    ).toBeVisible();
    expect(vitrine.queryByRole("button")).toBeNull();
  });

  it("mostra data e motivo quando a pessoa foi ocultada pelo Admin", async () => {
    abrir(pessoaOcultaNaVitrine);

    const vitrine = await secao();
    expect(
      vitrine.getByText(
        "Oculta pelo Admin em 05/11/2026. Motivo: Mini bio com conteúdo promocional.",
      ),
    ).toBeVisible();
    expect(vitrine.getByRole("button", { name: "Voltar a exibir" })).toBeVisible();
    expect(vitrine.queryByRole("button", { name: "Ocultar da vitrine" })).toBeNull();
  });

  it("exige motivo para ocultar, envia o corpo certo, avisa e invalida a vitrine", async () => {
    const clienteConsultas = abrir(pessoaNaVitrine);

    const vitrine = await secao();
    expect(
      vitrine.getByText(
        "Exibida na vitrine — ativada pela própria pessoa em Meu perfil > Preferências.",
      ),
    ).toBeVisible();
    await usuario.click(vitrine.getByRole("button", { name: "Ocultar da vitrine" }));

    const dialogo = within(screen.getByRole("dialog", { name: "Ocultar da vitrine?" }));
    expect(dialogo.getByText(/receberá um e-mail com o motivo/)).toBeVisible();
    const confirmar = dialogo.getByRole("button", { name: "Ocultar da vitrine" });
    expect(confirmar).toBeDisabled();
    await usuario.type(dialogo.getByLabelText("Motivo"), "   ");
    expect(confirmar).toBeDisabled();
    await usuario.clear(dialogo.getByLabelText("Motivo"));
    await usuario.type(dialogo.getByLabelText("Motivo"), "Foto inadequada");
    await usuario.click(confirmar);

    expect(await screen.findByText("Profissional ocultado")).toBeVisible();
    expect(requisicoes).toEqual([{ metodo: "POST", corpo: { motivo: "Foto inadequada" } }]);
    expect(
      await screen.findByText("Oculta pelo Admin em 10/11/2026. Motivo: Foto inadequada"),
    ).toBeVisible();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(clienteConsultas.getQueryState(CHAVE_VITRINE)?.isInvalidated).toBe(true);
  });

  it("volta a exibir com confirmação simples pelo DELETE e invalida a vitrine", async () => {
    const clienteConsultas = abrir(pessoaOcultaNaVitrine);

    const vitrine = await secao();
    await usuario.click(vitrine.getByRole("button", { name: "Voltar a exibir" }));
    const dialogo = within(screen.getByRole("dialog", { name: "Voltar a exibir na vitrine?" }));
    expect(dialogo.queryByLabelText(/Motivo/)).toBeNull();
    await usuario.click(dialogo.getByRole("button", { name: "Voltar a exibir" }));

    expect(await screen.findByText("Profissional exibido novamente")).toBeVisible();
    expect(requisicoes).toEqual([{ metodo: "DELETE", corpo: undefined }]);
    expect(await vitrine.findByRole("button", { name: "Ocultar da vitrine" })).toBeVisible();
    expect(clienteConsultas.getQueryState(CHAVE_VITRINE)?.isInvalidated).toBe(true);
  });

  it("mostra no diálogo o erro do backend para o motivo", async () => {
    abrir(pessoaNaVitrine);
    servidor.use(
      http.post(ROTA_OCULTAR, () =>
        HttpResponse.json(
          { codigo: "DADOS_INVALIDOS", campos: { motivo: ["Informe o motivo."] } },
          { status: 422 },
        ),
      ),
    );

    const vitrine = await secao();
    await usuario.click(vitrine.getByRole("button", { name: "Ocultar da vitrine" }));
    const dialogo = within(screen.getByRole("dialog", { name: "Ocultar da vitrine?" }));
    await usuario.type(dialogo.getByLabelText("Motivo"), "x");
    await usuario.click(dialogo.getByRole("button", { name: "Ocultar da vitrine" }));

    expect(await dialogo.findByRole("alert")).toHaveTextContent("Informe o motivo.");
  });

  it("mostra no diálogo a falha ao voltar a exibir", async () => {
    abrir(pessoaOcultaNaVitrine);
    servidor.use(http.delete(ROTA_OCULTAR, () => HttpResponse.json({}, { status: 500 })));

    const vitrine = await secao();
    await usuario.click(vitrine.getByRole("button", { name: "Voltar a exibir" }));
    const dialogo = within(screen.getByRole("dialog", { name: "Voltar a exibir na vitrine?" }));
    await usuario.click(dialogo.getByRole("button", { name: "Voltar a exibir" }));

    expect(await dialogo.findByRole("alert")).toBeInTheDocument();
  });

  it("avisa e recarrega o detalhe quando a pessoa não existe mais", async () => {
    abrir(pessoaNaVitrine);

    const vitrine = await secao();
    servidor.use(
      http.post(ROTA_OCULTAR, () => new HttpResponse(null, { status: 404 })),
      http.get("*/api/admin/pessoas/:id", () => new HttpResponse(null, { status: 404 })),
    );
    await usuario.click(vitrine.getByRole("button", { name: "Ocultar da vitrine" }));
    const dialogo = within(screen.getByRole("dialog", { name: "Ocultar da vitrine?" }));
    await usuario.type(dialogo.getByLabelText("Motivo"), "Spam");
    await usuario.click(dialogo.getByRole("button", { name: "Ocultar da vitrine" }));

    expect(
      await screen.findByText("Esta pessoa não foi encontrada. Os dados foram recarregados."),
    ).toBeVisible();
    await waitFor(() => expect(screen.getByText("Pessoa não encontrada")).toBeVisible());
  });
});
