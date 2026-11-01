import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CartaoOpcao } from "./CartaoOpcao";

describe("CartaoOpcao", () => {
  it("funciona como um grupo de rádios pelo nome", async () => {
    render(
      <fieldset>
        <legend>Forma de resgate</legend>
        <CartaoOpcao name="tipo" value="CUPOM" rotulo="Cupom compartilhado" />
        <CartaoOpcao
          name="tipo"
          value="INSTRUCAO"
          rotulo="Instrução por texto"
          descricao="Sem código"
        />
      </fieldset>,
    );

    await userEvent.click(screen.getByText("Instrução por texto"));

    expect(screen.getByRole("radio", { name: /Instrução por texto/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /Cupom compartilhado/ })).not.toBeChecked();
    expect(screen.getByText("Sem código")).toBeInTheDocument();
  });
});
