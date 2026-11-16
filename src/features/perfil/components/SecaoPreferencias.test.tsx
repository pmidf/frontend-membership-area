import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { chavesProfissionais } from "@/features/profissionais/api/profissionais.queries";
import type { Perfil } from "@/shared/sessao/tipos";
import { perfilFiliado, perfilNaoFiliado } from "@/test/fixtures/pessoas";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import type { Preferencias } from "../api/preferencias.api";
import { handlersPreferencias, preferenciasTeste } from "../mocks/perfil.handlers";
import { SecaoPreferencias } from "./SecaoPreferencias";

const ROTA = "*/api/me/preferencias";
const CHAVE_VITRINE = chavesProfissionais.lista({});

let usuario: ReturnType<typeof userEvent.setup>;
let corpos: unknown[];

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
  corpos = [];
  servidor.events.on("request:start", async ({ request }) => {
    if (request.method === "PATCH" && request.url.includes("/me/preferencias")) {
      corpos.push(await request.clone().json());
    }
  });
});

afterEach(() => servidor.events.removeAllListeners());

async function abrir(
  perfil: Perfil = perfilFiliado,
  preferencias: Preferencias = preferenciasTeste,
) {
  const { clienteConsultas } = renderizar(<SecaoPreferencias perfil={perfil} />, {
    sessao: perfil,
  });
  clienteConsultas.setQueryData(CHAVE_VITRINE, {
    total: 0,
    pagina: 1,
    total_paginas: 0,
    itens: [],
  });
  servidor.use(...handlersPreferencias(perfil, preferencias));
  await screen.findByRole("switch", { name: "Gamificação" });
  return clienteConsultas;
}

const interruptor = (nome: string | RegExp) => screen.getByRole("switch", { name: nome });
const VITRINE = /Exibir meu perfil/;
const avisos = () => within(screen.getByRole("region", { name: "Avisos" }));

describe("Preferências", () => {
  it("mostra os três interruptores com o estado salvo", async () => {
    await abrir();

    expect(screen.getByRole("heading", { name: "Preferências" })).toBeVisible();
    expect(
      screen.getByText("Controle sua exposição e o volume de mensagens que recebe."),
    ).toBeVisible();
    expect(interruptor("Gamificação")).toBeChecked();
    expect(interruptor("E-mail marketing")).not.toBeChecked();
    expect(interruptor(VITRINE)).not.toBeChecked();
    expect(interruptor(VITRINE)).toBeEnabled();
    expect(screen.queryByText("Disponível para filiados")).toBeNull();
  });

  it("salva cada alternância na hora e avisa", async () => {
    await abrir();

    await usuario.click(interruptor("Gamificação"));
    expect(interruptor("Gamificação")).not.toBeChecked();
    expect(await avisos().findByText("Preferência salva")).toBeVisible();

    await usuario.click(interruptor("E-mail marketing"));
    await waitFor(() => expect(interruptor("E-mail marketing")).toBeChecked());

    expect(corpos).toEqual([{ gamificacao: false }, { email_marketing: true }]);
  });

  it("deixa a vitrine desabilitada para quem não é filiado", async () => {
    await abrir(perfilNaoFiliado, { ...preferenciasTeste, exibir_vitrine: true });

    expect(interruptor(VITRINE)).toBeDisabled();
    expect(interruptor(VITRINE)).not.toBeChecked();
    expect(screen.getByText("Disponível para filiados")).toBeVisible();
  });

  it("pede confirmação mostrando os dados exibidos antes de ligar a vitrine", async () => {
    const clienteConsultas = await abrir();

    await usuario.click(interruptor(VITRINE));
    const dialogo = within(screen.getByRole("dialog", { name: "Exibir seu perfil na vitrine?" }));
    const dados = within(dialogo.getByLabelText("Dados exibidos na vitrine"));
    expect(dados.getByText(perfilFiliado.nome_completo)).toBeVisible();
    expect(dados.getByText(perfilFiliado.cargo)).toBeVisible();
    expect(dados.getByText(perfilFiliado.empresa)).toBeVisible();
    expect(dados.getByText("Brasília/DF")).toBeVisible();
    expect(dados.getByText("Não preenchida")).toBeVisible();
    expect(dados.getByText(perfilFiliado.linkedin_url as string)).toBeVisible();
    expect(dialogo.getByText(/E-mail, telefone e endereço nunca aparecem/)).toBeVisible();
    expect(interruptor(VITRINE)).not.toBeChecked();

    await usuario.click(dialogo.getByRole("button", { name: "Exibir meu perfil" }));

    expect(await avisos().findByText("Preferência salva")).toBeVisible();
    expect(interruptor(VITRINE)).toBeChecked();
    expect(corpos).toEqual([{ exibir_vitrine: true }]);
    expect(clienteConsultas.getQueryState(CHAVE_VITRINE)?.isInvalidated).toBe(true);
  });

  it("não salva nada ao cancelar a confirmação da vitrine", async () => {
    await abrir();

    await usuario.click(interruptor(VITRINE));
    await usuario.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(interruptor(VITRINE)).not.toBeChecked();
    expect(corpos).toEqual([]);
  });

  it("desliga a vitrine sem pedir confirmação", async () => {
    await abrir(perfilFiliado, { ...preferenciasTeste, exibir_vitrine: true });

    await usuario.click(interruptor(VITRINE));

    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(() => expect(corpos).toEqual([{ exibir_vitrine: false }]));
    expect(interruptor(VITRINE)).not.toBeChecked();
  });

  it("volta o interruptor ao estado anterior e mostra o erro quando falha ao salvar", async () => {
    await abrir();
    servidor.use(
      http.patch(ROTA, () => HttpResponse.json({ codigo: "FILIACAO_NECESSARIA" }, { status: 403 })),
    );

    await usuario.click(interruptor("E-mail marketing"));

    expect(
      await avisos().findByText("Este recurso é exclusivo para filiados com filiação ativa."),
    ).toBeVisible();
    await waitFor(() => expect(interruptor("E-mail marketing")).not.toBeChecked());
  });

  it("mostra erro com tentar de novo quando não carrega as preferências", async () => {
    renderizar(<SecaoPreferencias perfil={perfilFiliado} />, { sessao: perfilFiliado });
    servidor.use(http.get(ROTA, () => HttpResponse.json({}, { status: 500 })));

    expect(await screen.findByText("Não foi possível carregar suas preferências.")).toBeVisible();
  });
});
