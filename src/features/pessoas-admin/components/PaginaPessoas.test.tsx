import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { perfilAdmin } from "@/test/fixtures/pessoas";
import { definirNavegacao, roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { pessoasTeste } from "../mocks/pessoas-admin.handlers";
import { PaginaPessoas } from "./PaginaPessoas";

let usuario: ReturnType<typeof userEvent.setup>;

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
});

afterEach(() => vi.restoreAllMocks());

function renderizarPagina(consulta = "") {
  definirNavegacao("/admin/pessoas", consulta);
  const resultado = renderizar(<PaginaPessoas />, { sessao: perfilAdmin });
  roteadorFalso.replace.mockImplementation((destino: string) => {
    const [caminho, parametros = ""] = destino.split("?");
    definirNavegacao(caminho, parametros);
    queueMicrotask(() => resultado.rerender(<PaginaPessoas />));
  });
  return resultado;
}

const tabela = () => screen.findByRole("table", { name: "Pessoas cadastradas" });
const campoBusca = () => screen.getByLabelText("Buscar por nome, e-mail ou PMI ID");

async function linhas() {
  await tabela();
  return within(screen.getByRole("table")).getAllByRole("row").slice(1);
}

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

describe("Lista de pessoas", () => {
  it("mostra a primeira página e o total de cadastradas", async () => {
    renderizarPagina();

    expect(await linhas()).toHaveLength(20);
    expect(screen.getByRole("heading", { name: "Pessoas", level: 1 })).toBeInTheDocument();
    expect(await screen.findByText("25")).toBeInTheDocument();
    expect(screen.getByText("Pessoas cadastradas")).toBeInTheDocument();
    expect(screen.getByText("Página 1 de 2")).toBeInTheDocument();
  });

  it("mostra selos de filiação, situação da conta e Admin", async () => {
    renderizarPagina();
    await tabela();

    const bruno = screen.getByRole("row", { name: /Bruno Tavares/ });
    expect(within(bruno).getByText("Suspensa")).toBeInTheDocument();
    expect(within(bruno).getByText("Não-Filiado")).toBeInTheDocument();
    expect(within(bruno).getByText("10/03/2026")).toBeInTheDocument();

    const camila = screen.getByRole("row", { name: /Camila Lopes/ });
    expect(within(camila).getByText("Filiado")).toBeInTheDocument();
    expect(within(camila).getByText("Ativa")).toBeInTheDocument();
    expect(within(camila).getByText("Hoje")).toBeInTheDocument();

    const rafael = screen.getByRole("row", { name: /Rafael Lima/ });
    expect(within(rafael).getByText("Admin")).toBeInTheDocument();
    expect(within(rafael).getByText("Não-Filiado")).toBeInTheDocument();
    expect(within(rafael).getByText("—", { selector: "td" })).toBeInTheDocument();
  });

  it("filtra depois do atraso, grava na URL e volta para a página 1", async () => {
    renderizarPagina("pagina=2");
    await tabela();

    await usuario.type(campoBusca(), "camila");
    expect(roteadorFalso.replace).not.toHaveBeenCalled();

    await waitFor(() =>
      expect(roteadorFalso.replace).toHaveBeenCalledWith("/admin/pessoas?busca=camila", {
        scroll: false,
      }),
    );
    await screen.findByRole("row", { name: /Camila Lopes/ });
    await waitFor(async () => expect(await linhas()).toHaveLength(1));
  });

  it("não busca com um ou dois caracteres e limpa ao esvaziar", async () => {
    renderizarPagina("busca=camila");
    await waitFor(async () => expect(await linhas()).toHaveLength(1));

    await usuario.clear(campoBusca());
    await usuario.type(campoBusca(), "ca");
    await new Promise((resolver) => setTimeout(resolver, 350));
    expect(roteadorFalso.replace).not.toHaveBeenCalled();

    await usuario.clear(campoBusca());
    await waitFor(() =>
      expect(roteadorFalso.replace).toHaveBeenCalledWith("/admin/pessoas", { scroll: false }),
    );
  });

  it("encontra a pessoa pelo PMI ID completo", async () => {
    renderizarPagina("busca=4471182");

    await screen.findByRole("row", { name: /Camila Lopes/ });
    expect(await linhas()).toHaveLength(1);
  });

  it("mantém o total geral enquanto há busca aplicada", async () => {
    renderizarPagina("busca=camila");

    await waitFor(async () => expect(await linhas()).toHaveLength(1));
    expect(await screen.findByText("25")).toBeInTheDocument();
  });

  it("pagina pela URL, sem manter ?pagina=1", async () => {
    renderizarPagina();
    await tabela();

    await usuario.click(screen.getByRole("button", { name: "Próxima" }));
    expect(roteadorFalso.replace).toHaveBeenLastCalledWith("/admin/pessoas?pagina=2", {
      scroll: false,
    });
    await waitFor(async () => expect(await linhas()).toHaveLength(5));
    expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Anterior" }));
    expect(roteadorFalso.replace).toHaveBeenLastCalledWith("/admin/pessoas", { scroll: false });
  });

  it("restaura a busca e a página da URL", async () => {
    renderizarPagina("busca=pessoa&pagina=2");

    await waitFor(async () => expect(await linhas()).toHaveLength(2));
    expect(campoBusca()).toHaveValue("pessoa");
    expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();
  });

  it.each(["abc", "0", "-1", "1.5"])("trata ?pagina=%s como a primeira", async (pagina) => {
    renderizarPagina(`pagina=${pagina}`);

    expect(await linhas()).toHaveLength(20);
    expect(screen.getByText("Página 1 de 2")).toBeInTheDocument();
  });

  it("volta para a última página ao passar do fim", async () => {
    renderizarPagina("pagina=9");

    await waitFor(() =>
      expect(roteadorFalso.replace).toHaveBeenCalledWith("/admin/pessoas?pagina=2", {
        scroll: false,
      }),
    );
    await waitFor(async () => expect(await linhas()).toHaveLength(5));
  });

  it("mostra o estado vazio com o termo buscado", async () => {
    renderizarPagina("busca=inexistente");

    expect(
      await screen.findByText("Nenhuma pessoa encontrada para 'inexistente'"),
    ).toBeInTheDocument();
  });

  it("mostra o erro e tenta de novo", async () => {
    let falhar = true;
    renderizarPagina();
    servidor.use(
      http.get("*/api/admin/pessoas", () =>
        falhar
          ? HttpResponse.json({}, { status: 500 })
          : HttpResponse.json({
              itens: pessoasTeste.slice(0, 1),
              total: 1,
              pagina: 1,
              tamanho: 20,
            }),
      ),
    );

    expect(await screen.findByText("Não foi possível carregar as pessoas.")).toBeInTheDocument();
    falhar = false;
    await usuario.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await linhas()).toHaveLength(1);
  });

  it("leva ao detalhe mantendo a busca e a página", async () => {
    renderizarPagina("busca=pessoa&pagina=2");
    await waitFor(async () => expect(await linhas()).toHaveLength(2));

    expect(screen.getByRole("link", { name: "Ver perfil de Pessoa 22" })).toHaveAttribute(
      "href",
      "/admin/pessoas/10000000-0000-4000-8000-000000000022?busca=pessoa&pagina=2",
    );
  });

  it("vira cartões no mobile, sem cadastro e último acesso", async () => {
    simularTelaPequena();
    renderizarPagina("busca=camila");

    const lista = await screen.findByRole("list", { name: "Pessoas cadastradas" });
    await waitFor(() => expect(within(lista).getAllByRole("listitem")).toHaveLength(1));
    const cartao = within(lista).getByRole("listitem");
    expect(within(cartao).getByText("camila.lopes@teste.pmidf.org.br")).toBeInTheDocument();
    expect(within(cartao).getByText("Filiado")).toBeInTheDocument();
    expect(within(cartao).getByRole("link", { name: /Ver perfil/ })).toBeInTheDocument();
    expect(within(cartao).queryByText("Cadastro")).not.toBeInTheDocument();
    expect(within(cartao).queryByText("Último acesso")).not.toBeInTheDocument();
  });
});
