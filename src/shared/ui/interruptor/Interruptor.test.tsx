import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Interruptor } from "./Interruptor";

describe("Interruptor", () => {
  it("é um switch com descrição que alterna ao clicar e pelo teclado", async () => {
    render(<Interruptor rotulo="Gamificação" descricao="Conquiste peças de quebra-cabeça." />);

    const interruptor = screen.getByRole("switch", { name: "Gamificação" });
    expect(interruptor).toHaveAccessibleDescription("Conquiste peças de quebra-cabeça.");

    await userEvent.click(interruptor);
    expect(interruptor).toBeChecked();

    await userEvent.keyboard(" ");
    expect(interruptor).not.toBeChecked();
  });

  it("respeita o estado desabilitado", async () => {
    render(<Interruptor rotulo="Vitrine" disabled />);

    const interruptor = screen.getByRole("switch", { name: "Vitrine" });
    await userEvent.click(interruptor);

    expect(interruptor).not.toBeChecked();
  });
});
