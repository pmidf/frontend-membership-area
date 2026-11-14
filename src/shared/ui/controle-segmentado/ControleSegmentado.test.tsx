import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { ControleSegmentado } from "./ControleSegmentado";

function Exemplo({ erro }: { erro?: string }) {
  const [valor, setValor] = useState<"sim" | "nao" | undefined>(undefined);
  return (
    <ControleSegmentado
      rotulo="Você já é filiado ao PMI?"
      valor={valor}
      aoMudar={setValor}
      erro={erro}
      opcoes={[
        { valor: "sim", rotulo: "Sim" },
        { valor: "nao", rotulo: "Não" },
      ]}
    />
  );
}

describe("ControleSegmentado", () => {
  it("é um radiogroup rotulado que seleciona ao clicar", async () => {
    render(<Exemplo />);

    expect(
      screen.getByRole("radiogroup", { name: "Você já é filiado ao PMI?" }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByText("Sim"));
    expect(screen.getByRole("radio", { name: "Sim" })).toBeChecked();
  });

  it("muda a seleção com as setas do teclado", async () => {
    render(<Exemplo />);

    await userEvent.click(screen.getByText("Sim"));
    await userEvent.keyboard("{ArrowRight}");

    expect(screen.getByRole("radio", { name: "Não" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Não" })).toHaveFocus();
  });

  it("anuncia o erro do grupo", () => {
    render(<Exemplo erro="Responda se você é filiado" />);

    expect(screen.getByRole("radiogroup")).toHaveAccessibleDescription(
      "Responda se você é filiado",
    );
  });
});
