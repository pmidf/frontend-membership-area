import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { Perfil } from "@/shared/sessao/tipos";
import {
  MOTIVO_VITRINE_OCULTA_TESTE,
  perfilFiliado,
  perfilFiliadoVitrineBloqueada,
  perfilNaoFiliado,
} from "@/test/fixtures/pessoas";
import { definirNavegacao, roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { camila, diego, handlersProfissionais } from "../mocks/profissionais.handlers";
import { PaginaProfissionais } from "./PaginaProfissionais";

const ESPERA = 4000;

let usuario: ReturnType<typeof userEvent.setup>;
let consultas: string[];

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
  consultas = [];
  servidor.events.on("request:start", ({ request }) => {
    const url = new URL(request.url);
    if (url.pathname === "/api/profissionais") consultas.push(url.search);
  });
});

afterEach(() => servidor.events.removeAllListeners());

function abrir(consulta = "", sessao: Perfil = perfilFiliado) {
  definirNavegacao("/profissionais", consulta);
  renderizar(<PaginaProfissionais />, { sessao });
  servidor.use(...handlersProfissionais());
}

const lista = () =>
  screen.findByRole("list", { name: "Profissionais da comunidade" }, { timeout: ESPERA });
const linhaDe = (nome: string) => {
  const linha = screen.getByRole("heading", { name: nome }).closest("li");
  if (!linha) throw new Error(`Linha de ${nome} não encontrada`);
  return within(linha);
};
const faixa = () => screen.queryByRole("region", { name: "Convite para a vitrine" });

describe("Vitrine de profissionais", { timeout: 15_000 }, () => {
  it("mostra cabeçalho, total e as linhas com avatar, cargo, empresa e local", async () => {
    abrir();
    await lista();

    expect(
      screen.getByRole("heading", { level: 1, name: "Profissionais da comunidade" }),
    ).toBeVisible();
    expect(screen.getByRole("heading", { name: "23 profissionais" })).toBeInTheDocument();

    const linhaCamila = linhaDe(camila.nome_completo);
    expect(linhaCamila.getByRole("img", { name: camila.nome_completo })).toHaveTextContent("CL");
    expect(linhaCamila.getByText("Gerente de Projetos Sênior · Construtora Vega")).toBeVisible();
    expect(linhaCamila.getByText("Brasília/DF")).toBeVisible();
    expect(
      linhaCamila.getByRole("link", { name: `Ver perfil de ${camila.nome_completo}` }),
    ).toHaveAttribute("href", `/profissionais/${camila.id_pessoa}`);

    expect(linhaDe(diego.nome_completo).getByRole("img")).toHaveAttribute("src", diego.foto_perfil);
  });

  it("nunca mostra dados de contato do profissional", async () => {
    abrir();
    await lista();

    expect(screen.queryByText(/@/)).toBeNull();
  });

  it("busca por nome, cargo ou empresa e atualiza a URL", async () => {
    abrir("pagina=2");
    await lista();

    await usuario.type(screen.getByLabelText("Buscar por nome, cargo ou empresa"), "PMO{Enter}");

    await waitFor(() =>
      expect(roteadorFalso.replace).toHaveBeenCalledWith("/profissionais?q=PMO", {
        scroll: false,
      }),
    );
  });

  it("filtra por UF pela URL", async () => {
    abrir();
    await lista();

    await usuario.selectOptions(screen.getByLabelText("UF"), "DF");

    expect(roteadorFalso.replace).toHaveBeenCalledWith("/profissionais?uf=DF", { scroll: false });
  });

  it("filtra por cidade pela URL", async () => {
    abrir();
    await lista();

    await usuario.type(screen.getByLabelText("Cidade"), "Goiânia{Enter}");

    await waitFor(() =>
      expect(roteadorFalso.replace).toHaveBeenCalledWith(
        `/profissionais?cidade=${encodeURIComponent("Goiânia")}`,
        { scroll: false },
      ),
    );
  });

  it("usa os filtros da URL na consulta e leva-os para o perfil", async () => {
    abrir("uf=go&q=nexa");
    await lista();

    expect(consultas).toContain("?q=nexa&uf=GO");
    expect(screen.getByLabelText("UF")).toHaveValue("GO");
    expect(screen.getByRole("heading", { name: "1 profissional" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: `Ver perfil de ${diego.nome_completo}` }),
    ).toHaveAttribute("href", `/profissionais/${diego.id_pessoa}?uf=go&q=nexa`);
  });

  it("pagina a lista", async () => {
    abrir();
    await lista();

    await usuario.click(screen.getByRole("button", { name: /próxima/i }));

    expect(roteadorFalso.replace).toHaveBeenCalledWith("/profissionais?pagina=2", {
      scroll: false,
    });
  });

  it("mostra vazio com limpar filtros quando o filtro não encontra ninguém", async () => {
    abrir("q=inexistente&uf=DF");

    expect(
      await screen.findByText("Nenhum profissional encontrado", {}, { timeout: ESPERA }),
    ).toBeVisible();
    await usuario.click(screen.getByRole("button", { name: "Limpar filtros" }));

    expect(roteadorFalso.replace).toHaveBeenCalledWith("/profissionais", { scroll: false });
  });

  it("mostra vazio sem limpar filtros quando a vitrine está vazia", async () => {
    definirNavegacao("/profissionais");
    renderizar(<PaginaProfissionais />, { sessao: perfilFiliado });
    servidor.use(...handlersProfissionais({ total: 0, pagina: 1, total_paginas: 0, itens: [] }));

    expect(
      await screen.findByText("Nenhum profissional encontrado", {}, { timeout: ESPERA }),
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: "Limpar filtros" })).toBeNull();
  });

  it("mostra erro com tentar de novo", async () => {
    definirNavegacao("/profissionais");
    renderizar(<PaginaProfissionais />, { sessao: perfilFiliado });
    servidor.use(http.get("*/api/profissionais", () => HttpResponse.json({}, { status: 500 })));

    expect(
      await screen.findByText(
        "Não foi possível carregar os profissionais.",
        {},
        { timeout: ESPERA },
      ),
    ).toBeVisible();
  });
});

describe("Faixa de convite da vitrine", { timeout: 15_000 }, () => {
  it("convida o filiado que não está na vitrine a ativar a exibição", async () => {
    abrir();
    await lista();

    const convite = within(faixa() as HTMLElement);
    expect(
      convite.getByText("Apareça aqui também — ative a exibição do seu perfil."),
    ).toBeVisible();
    expect(
      convite.getByRole("link", { name: "Ir para Meu perfil > Preferências" }),
    ).toHaveAttribute("href", "/perfil#preferencias");
  });

  it("não aparece para o filiado que já está na vitrine", async () => {
    abrir("", { ...perfilFiliado, exibindo_na_vitrine: true });
    await lista();

    expect(faixa()).toBeNull();
  });

  it("avisa quem foi ocultado pelo Admin, com o motivo, no lugar do convite", async () => {
    abrir("", perfilFiliadoVitrineBloqueada);
    await lista();

    expect(faixa()).toBeNull();
    const aviso = within(screen.getByRole("region", { name: "Perfil ocultado da vitrine" }));
    expect(aviso.getByText("Seu perfil foi ocultado da vitrine pelo PMI-DF.")).toBeVisible();
    expect(aviso.getByText(MOTIVO_VITRINE_OCULTA_TESTE)).toBeVisible();
    expect(aviso.getByText("Para resolver, fale com a diretoria do PMI-DF.")).toBeVisible();
    expect(aviso.queryByRole("link")).toBeNull();
  });

  it("mostra o aviso de bloqueio também para o não filiado ocultado", async () => {
    abrir("", { ...perfilNaoFiliado, vitrine_bloqueada: true, motivo_vitrine_oculta: null });
    await lista();

    expect(faixa()).toBeNull();
    const aviso = within(screen.getByRole("region", { name: "Perfil ocultado da vitrine" }));
    expect(aviso.getByText("não informado", { exact: false })).toBeVisible();
  });

  it("explica ao não filiado que só filiados se apresentam e registra a conversão", async () => {
    const cliques: unknown[] = [];
    servidor.events.on("request:start", async ({ request }) => {
      if (new URL(request.url).pathname === "/api/conversao/cta")
        cliques.push(await request.clone().json());
    });
    abrir("", perfilNaoFiliado);
    await lista();

    const convite = within(faixa() as HTMLElement);
    expect(convite.getByText("Apenas filiados podem se apresentar aqui.")).toBeVisible();
    const botao = convite.getByRole("link", { name: /Quero ser filiado/ });
    botao.addEventListener("click", (evento) => evento.preventDefault());
    await usuario.click(botao);

    await waitFor(() => expect(cliques).toEqual([{ origem: "VITRINE" }]));
  });
});
