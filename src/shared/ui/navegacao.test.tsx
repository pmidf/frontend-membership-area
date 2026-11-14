import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { Abas } from "./abas/Abas";
import { AbasNavegacao } from "./abas/AbasNavegacao";
import { FiltrosChip } from "./filtros-chip/FiltrosChip";
import { Paginacao } from "./paginacao/Paginacao";

function ExemploAbas() {
  const [ativa, setAtiva] = useState<"lista" | "calendario" | "mapa">("lista");
  return (
    <Abas
      rotulo="Visualização da agenda"
      ativa={ativa}
      aoMudar={setAtiva}
      abas={[
        { valor: "lista", rotulo: "Lista", conteudo: <p>Conteúdo da lista</p> },
        { valor: "calendario", rotulo: "Calendário", conteudo: <p>Conteúdo do calendário</p> },
        { valor: "mapa", rotulo: "Mapa", conteudo: <p>Conteúdo do mapa</p> },
      ]}
    />
  );
}

describe("Abas", () => {
  it("troca de painel por clique e por setas, Home e End", async () => {
    render(<ExemploAbas />);

    expect(screen.getByRole("tabpanel")).toHaveTextContent("Conteúdo da lista");

    await userEvent.click(screen.getByRole("tab", { name: "Calendário" }));
    expect(screen.getByRole("tab", { name: "Calendário" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tabpanel", { name: "Calendário" })).toHaveTextContent(
      "Conteúdo do calendário",
    );

    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Mapa" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Lista" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Mapa" })).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{Home}{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Mapa" })).toHaveFocus();
  });
});

describe("AbasNavegacao", () => {
  it("marca o link atual como página atual", () => {
    render(
      <AbasNavegacao
        rotulo="Módulo de eventos"
        atual="/admin/eventos/numeros"
        links={[
          { href: "/admin/eventos", rotulo: "Eventos" },
          { href: "/admin/eventos/numeros", rotulo: "Números" },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "Números" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Eventos" })).not.toHaveAttribute("aria-current");
  });
});

describe("FiltrosChip", () => {
  const opcoes = [
    { valor: "todas", rotulo: "Todas" },
    { valor: "EDUCACAO", rotulo: "Educação" },
    { valor: "EVENTOS", rotulo: "Eventos" },
  ];

  it("seleciona um único chip por vez", async () => {
    const aoMudar = vi.fn();
    render(
      <FiltrosChip rotulo="Categoria" opcoes={opcoes} selecionados={["todas"]} aoMudar={aoMudar} />,
    );

    expect(screen.getByRole("button", { name: "Todas" })).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(screen.getByRole("button", { name: "Educação" }));

    expect(aoMudar).toHaveBeenCalledWith(["EDUCACAO"]);
  });

  it("alterna vários chips no modo múltiplo", async () => {
    const aoMudar = vi.fn();
    render(
      <FiltrosChip
        rotulo="Categoria"
        opcoes={opcoes}
        selecionados={["EDUCACAO"]}
        aoMudar={aoMudar}
        multiplo
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Eventos" }));
    expect(aoMudar).toHaveBeenLastCalledWith(["EDUCACAO", "EVENTOS"]);
    await userEvent.click(screen.getByRole("button", { name: "Educação" }));
    expect(aoMudar).toHaveBeenLastCalledWith([]);
  });
});

describe("Paginacao", () => {
  it("desabilita Anterior na primeira página e avança", async () => {
    const aoMudar = vi.fn();
    render(<Paginacao pagina={1} totalPaginas={3} aoMudar={aoMudar} />);

    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    expect(screen.getByText("Página 1 de 3")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Próxima" }));

    expect(aoMudar).toHaveBeenCalledWith(2);
  });

  it("desabilita Próxima na última página e some com uma página só", () => {
    const { rerender } = render(<Paginacao pagina={3} totalPaginas={3} aoMudar={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Próxima" })).toBeDisabled();

    rerender(<Paginacao pagina={1} totalPaginas={1} aoMudar={vi.fn()} />);
    expect(screen.queryByRole("navigation", { name: "Paginação" })).not.toBeInTheDocument();
  });
});
