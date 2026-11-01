import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { IndicadorEtapas } from "./IndicadorEtapas";

describe("IndicadorEtapas", () => {
  it("mostra o passo atual e marca a etapa corrente", () => {
    render(<IndicadorEtapas atual={2} total={4} titulo="Dados pessoais" />);

    expect(screen.getByText("Passo 2 de 4 · Dados pessoais")).toBeInTheDocument();
    const etapas = screen.getAllByRole("listitem");
    expect(etapas).toHaveLength(4);
    expect(etapas[1]).toHaveAttribute("aria-current", "step");
    expect(etapas[0]).toHaveTextContent("Passo 1: concluído");
    expect(etapas[3]).toHaveTextContent("Passo 4: pendente");
  });
});
