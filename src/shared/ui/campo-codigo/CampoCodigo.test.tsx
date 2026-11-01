import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { CampoCodigo } from "./CampoCodigo";

function Exemplo({ aoCompletar }: { aoCompletar?: (codigo: string) => void }) {
  const [valor, setValor] = useState("");
  return (
    <>
      <CampoCodigo
        rotulo="Código de confirmação"
        valor={valor}
        aoMudar={setValor}
        aoCompletar={aoCompletar}
      />
      <output>{valor}</output>
    </>
  );
}

function caixas() {
  return screen.getAllByRole("textbox");
}

describe("CampoCodigo", () => {
  it("avança o foco a cada dígito e completa com 6 dígitos", async () => {
    const aoCompletar = vi.fn();
    render(<Exemplo aoCompletar={aoCompletar} />);

    await userEvent.click(caixas()[0]);
    await userEvent.keyboard("123456");

    expect(screen.getByRole("status")).toHaveTextContent("123456");
    expect(aoCompletar).toHaveBeenCalledWith("123456");
  });

  it("preenche todas as caixas ao colar o código", async () => {
    const aoCompletar = vi.fn();
    render(<Exemplo aoCompletar={aoCompletar} />);

    await userEvent.click(caixas()[0]);
    await userEvent.paste("12-34 56");

    expect(caixas().map((caixa) => (caixa as HTMLInputElement).value)).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
    ]);
    expect(aoCompletar).toHaveBeenCalledWith("123456");
  });

  it("ignora caracteres que não são dígitos", async () => {
    render(<Exemplo />);

    await userEvent.click(caixas()[0]);
    await userEvent.keyboard("a");

    expect(caixas()[0]).toHaveValue("");
    expect(caixas()[0]).toHaveFocus();
  });

  it("volta para a caixa anterior e a limpa com Backspace", async () => {
    render(<Exemplo />);

    await userEvent.click(caixas()[0]);
    await userEvent.keyboard("12");
    expect(caixas()[2]).toHaveFocus();

    await userEvent.keyboard("{Backspace}");

    expect(caixas()[1]).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("1");
  });

  it("expõe o grupo rotulado, cada dígito e o erro", () => {
    render(<CampoCodigo rotulo="Código" valor="" aoMudar={vi.fn()} erro="Código incorreto" />);

    expect(screen.getByRole("group", { name: "Código" })).toHaveAccessibleDescription(
      "Código incorreto",
    );
    expect(screen.getByLabelText("Dígito 1 de 6")).toHaveAttribute("inputmode", "numeric");
    expect(screen.getByLabelText("Dígito 1 de 6")).toHaveAttribute("autocomplete", "one-time-code");
  });
});
