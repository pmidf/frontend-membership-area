import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { perfilAdmin } from "@/test/fixtures/pessoas";
import { definirNavegacao, roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { PaginaBeneficiosAdmin } from "./PaginaBeneficiosAdmin";

let usuario: ReturnType<typeof userEvent.setup>;
let consultaExportacao: string | null;

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
  consultaExportacao = null;
  servidor.events.on("request:start", ({ request }) => {
    const url = new URL(request.url);
    if (url.pathname.endsWith("/export.csv")) consultaExportacao = url.search;
  });
});

afterEach(() => {
  servidor.events.removeAllListeners();
  vi.restoreAllMocks();
});

const ESPERA_DA_TABELA = 4000;

function abrir(consulta = "") {
  definirNavegacao("/admin/beneficios", consulta);
  const resultado = renderizar(<PaginaBeneficiosAdmin />, { sessao: perfilAdmin });
  roteadorFalso.replace.mockImplementation((destino: string) => {
    const [caminho, parametros = ""] = destino.split("?");
    definirNavegacao(caminho, parametros);
    queueMicrotask(() => resultado.rerender(<PaginaBeneficiosAdmin />));
  });
  return resultado;
}

const tabela = () =>
  screen.findByRole("table", { name: "Benefícios cadastrados" }, { timeout: ESPERA_DA_TABELA });

async function linhas() {
  await tabela();
  return within(screen.getByRole("table")).getAllByRole("row").slice(1);
}

const substituicao = (destino: string) =>
  waitFor(() => expect(roteadorFalso.replace).toHaveBeenCalledWith(destino, { scroll: false }));

function simularTelaPequena() {
  vi.spyOn(window, "matchMedia").mockImplementation((consulta) => ({
    matches: true,
    media: consulta,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe("Lista de benefícios do Admin", { timeout: 15_000 }, () => {
  it("mostra os indicadores e 20 benefícios", async () => {
    abrir();

    expect(await linhas()).toHaveLength(20);
    const publicados = (await screen.findByText("Publicados")).parentElement!;
    await waitFor(() => expect(publicados).toHaveTextContent("23Publicados"));
    const rascunhos = screen.getByText("Em rascunho").parentElement!;
    await waitFor(() => expect(rascunhos).toHaveTextContent("1Em rascunho"));
    expect(screen.getByText("Página 1 de 2")).toBeInTheDocument();
  });

  it("descreve cada benefício", async () => {
    abrir();
    await tabela();

    const voucher = within(screen.getByRole("row", { name: /Voucher do exame PMP/ }));
    expect(voucher.getByText("Categoria: Certificação")).toBeInTheDocument();
    expect(voucher.getByText("PMI Global")).toBeInTheDocument();
    expect(voucher.getByText("Cupom compartilhado")).toBeInTheDocument();
    expect(voucher.getByText("01/01 a 31/12/2026")).toBeInTheDocument();
    expect(voucher.getByText("18")).toBeInTheDocument();
    expect(voucher.getByText("Publicado")).toBeInTheDocument();
    expect(voucher.getByRole("link", { name: "Editar Voucher do exame PMP" })).toHaveAttribute(
      "href",
      "/admin/beneficios/40000000-0000-4000-8000-000000000001",
    );

    const consultoria = within(screen.getByRole("row", { name: /Consultoria de carreira/ }));
    expect(consultoria.getByText("Instrução por texto")).toBeInTheDocument();
    expect(consultoria.getByText("Sem data de término")).toBeInTheDocument();
    expect(consultoria.getByText("Rascunho")).toBeInTheDocument();
  });

  it("filtra arquivados, mostra a ação Ver e volta para a página 1", async () => {
    abrir("pagina=2");
    await tabela();

    await usuario.selectOptions(screen.getByLabelText("Status"), "ARQUIVADO");

    await substituicao("/admin/beneficios?situacao=ARQUIVADO");
    await waitFor(async () => expect(await linhas()).toHaveLength(1));
    expect(screen.getByRole("link", { name: "Ver Curso de liderança" })).toBeInTheDocument();
  });

  it.each([
    ["Forma de resgate", "INSTRUCAO", "tipo_resgate"],
    ["Categoria", "EDUCACAO", "categoria"],
    ["Vigência", "ENCERRADA", "vigencia"],
  ])("grava o filtro %s na URL", async (rotulo, valor, parametro) => {
    abrir();
    await tabela();

    await usuario.selectOptions(screen.getByLabelText(rotulo), valor);

    await substituicao(`/admin/beneficios?${parametro}=${valor}`);
  });

  it("busca depois do atraso e grava na URL", async () => {
    abrir();
    await tabela();

    await usuario.type(screen.getByRole("searchbox"), "voucher");

    await substituicao("/admin/beneficios?q=voucher");
    await waitFor(async () => expect(await linhas()).toHaveLength(1));
  });

  it("alterna a ordenação por resgates", async () => {
    abrir();
    await tabela();
    const cabecalho = () => screen.getByRole("columnheader", { name: "Resgates" });
    const botao = () => within(cabecalho()).getByRole("button", { name: "Resgates" });
    expect(cabecalho()).toHaveAttribute("aria-sort", "none");

    await usuario.click(botao());
    await substituicao("/admin/beneficios?ordenar=resgates_desc");
    await waitFor(() => expect(cabecalho()).toHaveAttribute("aria-sort", "descending"));
    await waitFor(async () => expect((await linhas())[0]).toHaveTextContent("Curso de liderança"));

    await usuario.click(botao());
    await substituicao("/admin/beneficios?ordenar=resgates_asc");
    await waitFor(() => expect(cabecalho()).toHaveAttribute("aria-sort", "ascending"));
  });

  it("restaura os filtros da URL", async () => {
    abrir("situacao=PUBLICADO&q=Benef%C3%ADcio&pagina=2");

    await waitFor(async () => expect(await linhas()).toHaveLength(2));
    expect(screen.getByLabelText("Status")).toHaveValue("PUBLICADO");
    expect(screen.getByRole("searchbox")).toHaveValue("Benefício");
  });

  it("volta para a última página ao passar do fim", async () => {
    abrir("pagina=9");

    await substituicao("/admin/beneficios?pagina=2");
  });

  it("leva a edição mantendo os filtros", async () => {
    abrir("situacao=ARQUIVADO");
    await waitFor(async () => expect(await linhas()).toHaveLength(1));

    expect(screen.getByRole("link", { name: "Ver Curso de liderança" })).toHaveAttribute(
      "href",
      "/admin/beneficios/40000000-0000-4000-8000-000000000003?situacao=ARQUIVADO",
    );
  });

  it("leva o botão Novo benefício para a rota de cadastro", async () => {
    abrir();

    expect(await screen.findByRole("link", { name: "Novo benefício" })).toHaveAttribute(
      "href",
      "/admin/beneficios/novo",
    );
  });

  it("mostra o vazio e limpa os filtros", async () => {
    abrir("q=inexistente&situacao=RASCUNHO");

    expect(
      await screen.findByText("Nenhum benefício encontrado", {}, { timeout: ESPERA_DA_TABELA }),
    ).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Limpar filtros" }));

    await substituicao("/admin/beneficios");
    await waitFor(() => expect(screen.getByRole("searchbox")).toHaveValue(""));
    expect(screen.getByLabelText("Status")).toHaveValue("");
  });

  it("mostra o erro e tenta de novo", async () => {
    let falhar = true;
    abrir();
    servidor.use(
      http.get("*/api/admin/beneficios", () =>
        falhar
          ? HttpResponse.json({}, { status: 500 })
          : HttpResponse.json({ total: 0, pagina: 1, total_paginas: 0, itens: [] }),
      ),
    );

    expect(
      await screen.findByText(
        "Não foi possível carregar os benefícios.",
        {},
        { timeout: ESPERA_DA_TABELA },
      ),
    ).toBeInTheDocument();
    falhar = false;
    await usuario.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByText("Nenhum benefício encontrado")).toBeInTheDocument();
  });

  it("exporta só os filtros, sem ordenação nem página, e confirma", async () => {
    URL.createObjectURL = vi.fn(() => "blob:teste");
    URL.revokeObjectURL = vi.fn();
    let nomeBaixado = "";
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      nomeBaixado = this.download;
    });
    abrir("situacao=PUBLICADO&ordenar=resgates_desc&pagina=2");
    await tabela();

    await usuario.click(screen.getByRole("button", { name: "Exportar CSV" }));

    expect(
      await within(screen.getByRole("region", { name: "Avisos" })).findByText("CSV exportado"),
    ).toBeInTheDocument();
    expect(consultaExportacao).toBe("?situacao=PUBLICADO");
    expect(nomeBaixado).toBe("beneficios-2026-11-09.csv");
  });

  it("avisa quando a exportação falha", async () => {
    abrir();
    await tabela();
    servidor.use(
      http.get("*/api/admin/beneficios/export.csv", () => HttpResponse.json({}, { status: 500 })),
    );

    await usuario.click(screen.getByRole("button", { name: "Exportar CSV" }));

    expect(
      await within(screen.getByRole("region", { name: "Avisos" })).findByText(
        "Não foi possível exportar. Tente novamente.",
      ),
    ).toBeInTheDocument();
  });

  it("vira cartões no mobile, sem a forma de resgate e com a ação", async () => {
    simularTelaPequena();
    abrir("situacao=ARQUIVADO");

    const lista = await screen.findByRole(
      "list",
      { name: "Benefícios cadastrados" },
      { timeout: ESPERA_DA_TABELA },
    );
    await waitFor(() => expect(within(lista).getAllByRole("listitem")).toHaveLength(1));
    const cartao = within(within(lista).getByRole("listitem"));
    expect(cartao.getByText("Curso de liderança")).toBeInTheDocument();
    expect(cartao.getByText("Impact Hub")).toBeInTheDocument();
    expect(cartao.getByText("37")).toBeInTheDocument();
    expect(cartao.queryByText("Forma de resgate")).toBeNull();
    expect(cartao.queryByRole("button", { name: "Resgates" })).toBeNull();
    expect(cartao.getByRole("link", { name: /^Ver / })).toBeInTheDocument();
  });
});
