import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CampoBusca } from "./CampoBusca";

describe("CampoBusca", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("busca só depois do atraso, com o último termo digitado", () => {
    const aoBuscar = vi.fn();
    render(<CampoBusca rotulo="Buscar benefício" aoBuscar={aoBuscar} />);

    const campo = screen.getByRole("searchbox", { name: "Buscar benefício" });
    fireEvent.change(campo, { target: { value: "PM" } });
    act(() => vi.advanceTimersByTime(200));
    fireEvent.change(campo, { target: { value: "PMP" } });
    act(() => vi.advanceTimersByTime(299));
    expect(aoBuscar).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1));
    expect(aoBuscar).toHaveBeenCalledOnce();
    expect(aoBuscar).toHaveBeenCalledWith("PMP");
  });

  it("não busca ao montar com o valor inicial e limpa pelo botão", () => {
    const aoBuscar = vi.fn();
    render(<CampoBusca rotulo="Buscar" aoBuscar={aoBuscar} valorInicial="vaga" />);

    act(() => vi.advanceTimersByTime(500));
    expect(aoBuscar).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Limpar busca" }));
    act(() => vi.advanceTimersByTime(300));

    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(aoBuscar).toHaveBeenCalledWith("");
  });
});
