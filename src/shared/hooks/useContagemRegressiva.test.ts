import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatarDuracao, useContagemRegressiva } from "./useContagemRegressiva";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useContagemRegressiva", () => {
  it("conta de segundo em segundo até zero", () => {
    const { result } = renderHook(() => useContagemRegressiva(2));
    expect(result.current).toMatchObject({ restantes: 2, ativa: true, rotulo: "0:02" });

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.restantes).toBe(1);

    act(() => vi.advanceTimersByTime(5000));
    expect(result.current).toMatchObject({ restantes: 0, ativa: false });
  });

  it("reinicia com os segundos informados, arredondando para cima", () => {
    const { result } = renderHook(() => useContagemRegressiva());
    expect(result.current.ativa).toBe(false);

    act(() => result.current.reiniciar(87.2));
    expect(result.current).toMatchObject({ restantes: 88, rotulo: "1:28" });

    act(() => result.current.reiniciar(-3));
    expect(result.current.restantes).toBe(0);
  });

  it("formata minutos e segundos", () => {
    expect(formatarDuracao(120)).toBe("2:00");
    expect(formatarDuracao(102)).toBe("1:42");
    expect(formatarDuracao(9)).toBe("0:09");
  });
});
