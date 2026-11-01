import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CampoAreaTexto } from "./CampoAreaTexto";

describe("CampoAreaTexto", () => {
  it("mostra o contador e bloqueia a partir do limite", async () => {
    const aoMudar = vi.fn();
    render(<CampoAreaTexto rotulo="Mini bio" maxLength={5} onChange={aoMudar} />);

    const campo = screen.getByLabelText("Mini bio");
    await userEvent.type(campo, "abcdefgh");

    expect(campo).toHaveValue("abcde");
    expect(screen.getByText("5/5")).toBeInTheDocument();
    expect(aoMudar).toHaveBeenCalled();
  });

  it("começa o contador pelo valor inicial", () => {
    render(<CampoAreaTexto rotulo="Descrição" maxLength={600} defaultValue="Olá" />);

    expect(screen.getByText("3/600")).toBeInTheDocument();
  });

  it("não mostra contador sem limite e anuncia o erro", () => {
    render(<CampoAreaTexto rotulo="Descrição" erro="Campo obrigatório" />);

    expect(screen.queryByText(/\/\d+/)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Descrição")).toHaveAccessibleDescription("Campo obrigatório");
  });
});
