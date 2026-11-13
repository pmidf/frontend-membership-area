import { describe, expect, it } from "vitest";

import { itemBloqueado, videoPublico, videoVisto } from "../mocks/conteudos.handlers";
import { conteudosAssistidos, maisRecentes } from "./resumo-catalogo";

describe("maisRecentes", () => {
  it("ordena pela data de publicação, com os sem data no fim", () => {
    const antigo = {
      ...videoPublico,
      id_conteudo: "antigo",
      data_publicacao: "2026-01-01T00:00:00Z",
    };
    const novo = { ...videoPublico, id_conteudo: "novo", data_publicacao: "2026-10-01T00:00:00Z" };
    const semData = { ...videoPublico, id_conteudo: "sem-data", data_publicacao: null };

    expect(maisRecentes([semData, antigo, novo]).map((item) => item.id_conteudo)).toEqual([
      "novo",
      "antigo",
      "sem-data",
    ]);
  });

  it("inclui os itens bloqueados na ordenação", () => {
    expect(maisRecentes([videoVisto, itemBloqueado])[0]).toBe(itemBloqueado);
  });
});

describe("conteudosAssistidos", () => {
  it("mantém só os itens consumidos, sem os bloqueados", () => {
    expect(conteudosAssistidos([videoVisto, videoPublico, itemBloqueado])).toEqual([videoVisto]);
  });

  it("ordena pela data em que a pessoa assistiu, não pela publicação", () => {
    const antigoVistoHoje = {
      ...videoVisto,
      id_conteudo: "antigo",
      data_publicacao: "2025-01-01T00:00:00Z",
      data_consumo: "2026-11-10T00:00:00Z",
    };
    const novoVistoAntes = {
      ...videoVisto,
      id_conteudo: "novo",
      data_publicacao: "2026-11-01T00:00:00Z",
      data_consumo: "2026-11-02T00:00:00Z",
    };

    expect(
      conteudosAssistidos([novoVistoAntes, antigoVistoHoje]).map((item) => item.id_conteudo),
    ).toEqual(["antigo", "novo"]);
  });
});
