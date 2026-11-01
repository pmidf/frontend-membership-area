import { describe, expect, it } from "vitest";

import { criarClienteConsultas } from "./criar-cliente-consultas";

describe("criarClienteConsultas", () => {
  it("aplica os padrões de cache e de nova tentativa do projeto", () => {
    const padroes = criarClienteConsultas().getDefaultOptions().queries;

    expect(padroes).toMatchObject({ staleTime: 60_000, retry: 1, refetchOnWindowFocus: false });
  });
});
