import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LayoutAutenticacao } from "./LayoutAutenticacao";

describe("LayoutAutenticacao", () => {
  it("apresenta o painel institucional e o conteúdo da página", () => {
    render(
      <LayoutAutenticacao>
        <h1>Bem-vindo de volta</h1>
      </LayoutAutenticacao>,
    );

    expect(screen.getByRole("main")).toHaveTextContent("Bem-vindo de volta");
    expect(screen.getAllByText(/A comunidade de gerenciamento de projetos do DF/)).toHaveLength(2);
    expect(screen.getByText("Clube de vantagens exclusivo para filiados")).toBeInTheDocument();
    expect(screen.getByText("PMI-DF · Project Management Institute")).toBeInTheDocument();
  });
});
