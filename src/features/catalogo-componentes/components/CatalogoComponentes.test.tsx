import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CatalogoComponentes } from "./CatalogoComponentes";

describe("CatalogoComponentes", () => {
  it("apresenta cada grupo de componentes", () => {
    render(<CatalogoComponentes />);

    for (const titulo of [
      "Botões",
      "Campos de texto",
      "Seleção",
      "Código, etapas e busca",
      "Formulário com validação",
    ]) {
      expect(screen.getByRole("region", { name: titulo })).toBeInTheDocument();
    }
  });

  it("valida o formulário de demonstração", async () => {
    render(<CatalogoComponentes />);

    await userEvent.click(screen.getByRole("button", { name: "Validar formulário" }));
    expect(await screen.findByText("Use pelo menos 10 caracteres")).toBeInTheDocument();

    await userEvent.type(screen.getByRole("textbox", { name: "E-mail" }), "maria@pmidf.org.br");
    await userEvent.type(screen.getAllByLabelText("Senha").at(-1)!, "senha-muito-forte");
    const primeiroDigito = screen.getAllByLabelText("Dígito 1 de 6").at(-1)!;
    await userEvent.click(primeiroDigito);
    await userEvent.keyboard("654321");
    await userEvent.click(screen.getByRole("button", { name: "Validar formulário" }));

    expect(await screen.findByText("Formulário válido.")).toBeInTheDocument();
  });
});
