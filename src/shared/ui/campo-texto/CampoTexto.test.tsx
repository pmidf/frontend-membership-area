import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CampoSenha } from "./CampoSenha";
import { CampoTexto } from "./CampoTexto";

describe("CampoTexto", () => {
  it("associa o rótulo ao campo e descreve com a ajuda", () => {
    render(<CampoTexto rotulo="E-mail" ajuda="Use o e-mail do MyPMI." />);

    const campo = screen.getByLabelText("E-mail");
    expect(campo).toHaveAccessibleDescription("Use o e-mail do MyPMI.");
    expect(campo).not.toHaveAttribute("aria-invalid");
  });

  it("anuncia o erro no lugar da ajuda", () => {
    render(<CampoTexto rotulo="E-mail" ajuda="Ajuda" erro="Informe um e-mail válido" />);

    const campo = screen.getByLabelText("E-mail");
    expect(campo).toHaveAttribute("aria-invalid", "true");
    expect(campo).toHaveAccessibleDescription("Informe um e-mail válido");
    expect(screen.queryByText("Ajuda")).not.toBeInTheDocument();
  });

  it("repassa as props nativas", async () => {
    render(<CampoTexto rotulo="Nome" placeholder="Como você quer ser chamado" />);

    const campo = screen.getByPlaceholderText("Como você quer ser chamado");
    await userEvent.type(campo, "Maria");

    expect(campo).toHaveValue("Maria");
  });
});

describe("CampoSenha", () => {
  it("alterna entre mostrar e ocultar a senha", async () => {
    render(<CampoSenha rotulo="Senha" />);

    const campo = screen.getByLabelText("Senha");
    expect(campo).toHaveAttribute("type", "password");

    await userEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(campo).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Ocultar senha" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
