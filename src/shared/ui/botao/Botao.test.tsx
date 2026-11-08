import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Botao } from "./Botao";

describe("Botao", () => {
  it("dispara o clique e usa type button por padrão", async () => {
    const aoClicar = vi.fn();
    render(<Botao onClick={aoClicar}>Entrar</Botao>);

    const botao = screen.getByRole("button", { name: "Entrar" });
    await userEvent.click(botao);

    expect(aoClicar).toHaveBeenCalledOnce();
    expect(botao).toHaveAttribute("type", "button");
  });

  it("não dispara o clique enquanto está carregando e expõe aria-busy", async () => {
    const aoClicar = vi.fn();
    render(
      <Botao carregando onClick={aoClicar}>
        Salvar
      </Botao>,
    );

    const botao = screen.getByRole("button", { name: "Salvar" });
    await userEvent.click(botao);

    expect(aoClicar).not.toHaveBeenCalled();
    expect(botao).toHaveAttribute("aria-busy", "true");
  });

  it("não dispara o clique quando desabilitado", async () => {
    const aoClicar = vi.fn();
    render(
      <Botao disabled onClick={aoClicar}>
        Publicar
      </Botao>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Publicar" }));

    expect(aoClicar).not.toHaveBeenCalled();
  });

  it("aplica a variante de perigo e a largura total", () => {
    render(
      <Botao variante="perigo" larguraTotal>
        Excluir
      </Botao>,
    );

    expect(screen.getByRole("button", { name: "Excluir" })).toHaveClass("bg-texto-erro", "w-full");
  });

  it("renderiza o ícone à esquerda do texto", () => {
    render(<Botao icone={<svg data-testid="icone" />}>Novo</Botao>);

    expect(screen.getByTestId("icone")).toBeInTheDocument();
  });
});
