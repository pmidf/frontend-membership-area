import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { EstadoErro } from "../estado/EstadoErro";
import { EstadoVazio } from "../estado/EstadoVazio";
import { Esqueleto } from "../esqueleto/Esqueleto";
import { Tabela, type ColunaTabela } from "./Tabela";

type Beneficio = { id: string; titulo: string; resgates: number };

const colunas: ColunaTabela<Beneficio>[] = [
  { id: "titulo", cabecalho: "Benefício", celula: (item) => item.titulo },
  { id: "resgates", cabecalho: "Resgates", celula: (item) => item.resgates, alinhamento: "fim" },
];

const itens: Beneficio[] = [
  { id: "1", titulo: "Voucher PMP", resgates: 18 },
  { id: "2", titulo: "Curso de liderança", resgates: 37 },
];

function simularTela(pequena: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation((consulta) => ({
    matches: pequena,
    media: consulta,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function ExemploSelecao() {
  const [selecionados, setSelecionados] = useState<string[]>([]);
  return (
    <>
      <Tabela
        rotulo="Benefícios"
        colunas={colunas}
        itens={itens}
        chave={(item) => item.id}
        selecao={{
          selecionados,
          aoMudar: setSelecionados,
          rotulo: (item) => `Selecionar ${item.titulo}`,
        }}
      />
      <output>{selecionados.join(",")}</output>
    </>
  );
}

describe("Tabela", () => {
  afterEach(() => vi.restoreAllMocks());

  it("renderiza a tabela com cabeçalhos e linhas no desktop", () => {
    simularTela(false);
    render(
      <Tabela rotulo="Benefícios" colunas={colunas} itens={itens} chave={(item) => item.id} />,
    );

    const tabela = screen.getByRole("table", { name: "Benefícios" });
    expect(
      within(tabela)
        .getAllByRole("columnheader")
        .map((celula) => celula.textContent),
    ).toEqual(["Benefício", "Resgates"]);
    expect(within(tabela).getAllByRole("row")).toHaveLength(3);
  });

  it("vira lista de cartões com rótulo e valor em tela pequena", () => {
    simularTela(true);
    render(
      <Tabela rotulo="Benefícios" colunas={colunas} itens={itens} chave={(item) => item.id} />,
    );

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    const cartoes = within(screen.getByRole("list", { name: "Benefícios" })).getAllByRole(
      "listitem",
    );
    expect(cartoes).toHaveLength(2);
    expect(within(cartoes[1]).getByText("Curso de liderança")).toBeInTheDocument();
    expect(within(cartoes[1]).getByText("Resgates").nextSibling).toHaveTextContent("37");
  });

  it("mostra o esqueleto ao carregar e o estado vazio sem itens", () => {
    simularTela(false);
    const { rerender } = render(
      <Tabela
        rotulo="Benefícios"
        colunas={colunas}
        itens={[]}
        chave={(item) => item.id}
        carregando
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Carregando…");

    rerender(
      <Tabela
        rotulo="Benefícios"
        colunas={colunas}
        itens={[]}
        chave={(item) => item.id}
        vazio={<EstadoVazio titulo="Nenhum benefício encontrado" />}
      />,
    );
    expect(screen.getByText("Nenhum benefício encontrado")).toBeInTheDocument();
  });

  it("seleciona linhas individualmente e todas de uma vez", async () => {
    simularTela(false);
    render(<ExemploSelecao />);

    await userEvent.click(screen.getByRole("checkbox", { name: "Selecionar Voucher PMP" }));
    expect(screen.getByRole("status")).toHaveTextContent("1");

    await userEvent.click(screen.getByRole("checkbox", { name: "Selecionar todos" }));
    expect(screen.getByRole("status")).toHaveTextContent("1,2");

    await userEvent.click(screen.getByRole("checkbox", { name: "Selecionar todos" }));
    expect(screen.getByRole("status")).toHaveTextContent("");
  });
});

describe("Esqueleto e EstadoErro", () => {
  it("anunciam carregamento e erro com tentativa", async () => {
    const aoTentarNovamente = vi.fn();
    render(
      <>
        <Esqueleto variante="cartao" quantidade={3} rotulo="Carregando benefícios" />
        <EstadoErro aoTentarNovamente={aoTentarNovamente} compacto />
      </>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Carregando benefícios");
    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível carregar");
    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(aoTentarNovamente).toHaveBeenCalledOnce();
  });
});
