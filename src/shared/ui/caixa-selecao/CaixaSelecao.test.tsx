import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CaixaSelecao } from "./CaixaSelecao";

describe("CaixaSelecao", () => {
  it("marca ao clicar no rótulo rico", async () => {
    render(
      <CaixaSelecao
        rotulo={
          <>
            Li e aceito os <a href="/termos">Termos de Uso</a>
          </>
        }
      />,
    );

    const caixa = screen.getByRole("checkbox", { name: /Li e aceito/ });
    await userEvent.click(screen.getByText(/Li e aceito/));

    expect(caixa).toBeChecked();
  });

  it("anuncia o erro", () => {
    render(<CaixaSelecao rotulo="Aceito" erro="É preciso aceitar os termos" />);

    expect(screen.getByRole("checkbox", { name: "Aceito" })).toHaveAccessibleDescription(
      "É preciso aceitar os termos",
    );
  });
});
