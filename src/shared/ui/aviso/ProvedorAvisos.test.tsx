import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ProvedorAvisos } from "./ProvedorAvisos";
import { useAvisos } from "./useAvisos";

function Disparador() {
  const avisos = useAvisos();
  return (
    <>
      <button onClick={() => avisos.sucesso("Vaga publicada")}>Sucesso</button>
      <button onClick={() => avisos.erro("Não foi possível exportar")}>Erro</button>
    </>
  );
}

describe("ProvedorAvisos", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("empilha avisos numa região aria-live e os remove após 5 segundos", () => {
    render(
      <ProvedorAvisos>
        <Disparador />
      </ProvedorAvisos>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Sucesso" }));
    act(() => vi.advanceTimersByTime(1000));
    fireEvent.click(screen.getByRole("button", { name: "Erro" }));

    const regiao = screen.getByRole("region", { name: "Avisos" });
    expect(regiao).toHaveAttribute("aria-live", "polite");
    expect(regiao).toHaveTextContent("Vaga publicada");
    expect(regiao).toHaveTextContent("Não foi possível exportar");

    act(() => vi.advanceTimersByTime(4000));
    expect(regiao).not.toHaveTextContent("Vaga publicada");
    expect(regiao).toHaveTextContent("Não foi possível exportar");
  });

  it("fecha um aviso pelo botão e não rouba o foco", () => {
    render(
      <ProvedorAvisos>
        <Disparador />
      </ProvedorAvisos>,
    );

    const gatilho = screen.getByRole("button", { name: "Sucesso" });
    gatilho.focus();
    fireEvent.click(gatilho);
    expect(gatilho).toHaveFocus();

    fireEvent.click(screen.getByRole("button", { name: "Fechar aviso" }));
    expect(screen.queryByText("Vaga publicada")).not.toBeInTheDocument();
  });

  it("exige o provedor", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Disparador />)).toThrow(
      "useAvisos precisa estar dentro de ProvedorAvisos",
    );
  });
});
