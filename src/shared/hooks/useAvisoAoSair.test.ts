import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useAvisoAoSair } from "./useAvisoAoSair";

function dispararSaida() {
  const evento = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(evento);
  return evento.defaultPrevented;
}

describe("useAvisoAoSair", () => {
  it("só pede confirmação enquanto estiver ativo", () => {
    const { rerender, unmount } = renderHook(({ ativo }) => useAvisoAoSair(ativo), {
      initialProps: { ativo: false },
    });
    expect(dispararSaida()).toBe(false);

    rerender({ ativo: true });
    expect(dispararSaida()).toBe(true);

    rerender({ ativo: false });
    expect(dispararSaida()).toBe(false);

    rerender({ ativo: true });
    unmount();
    expect(dispararSaida()).toBe(false);
  });
});
