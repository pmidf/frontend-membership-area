import { screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw/http";
import { describe, expect, it } from "vitest";

import { pessoaDetalheTeste } from "@/features/pessoas-admin/mocks/pessoas-admin.handlers";
import { perfilAdmin } from "@/test/fixtures/pessoas";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import type { LinhaRanking } from "../tipos/quebra-cabeca-admin";
import { PaginaRankingGamificacao } from "./PaginaRankingGamificacao";

const id = (numero: number) => `50000000-0000-4000-8000-${String(numero).padStart(12, "0")}`;

const nomes = [
  "Maria Souza",
  "Rafael Lima",
  "Ana Beatriz Costa",
  "João Pedro Alves",
  "Carla Mendes",
  "Bruno Tavares",
  "Fernanda Rocha",
  "Lucas Martins",
  "Isabela Nunes",
  "Pedro Henrique Dias",
];

const ranking: LinhaRanking[] = nomes.map((_, indice) => ({
  pessoa_id: id(indice + 1),
  concluidos: 10 - indice,
  total_publicados: 12,
  pecas_atual: indice % 8,
}));

function abrir(linhas: LinhaRanking[] = ranking, removidas: string[] = []) {
  renderizar(<PaginaRankingGamificacao />, { sessao: perfilAdmin });
  servidor.use(
    http.get("*/api/admin/gamificacao/ranking", () => HttpResponse.json(linhas)),
    http.get("*/api/admin/pessoas/:id", ({ params }) => {
      const indice = ranking.findIndex((linha) => linha.pessoa_id === params.id);
      if (indice < 0 || removidas.includes(String(params.id))) {
        return HttpResponse.json({ codigo: "PESSOA_NAO_ENCONTRADA" }, { status: 404 });
      }
      return HttpResponse.json({
        ...pessoaDetalheTeste,
        id_pessoa: params.id,
        nome_completo: nomes[indice],
      });
    }),
  );
}

describe("Ranking de gamificação", () => {
  it("lista os 10 filiados na ordem, com a posição de cada um", async () => {
    abrir();

    expect(await screen.findByRole("link", { name: "Maria Souza" })).toHaveAttribute(
      "href",
      `/admin/pessoas/${id(1)}`,
    );
    expect(await screen.findByRole("link", { name: "Pedro Henrique Dias" })).toBeInTheDocument();

    const primeira = within(
      screen
        .getByRole("link", { name: "Maria Souza" })
        .closest("tr, li, [role='row']") as HTMLElement,
    );
    expect(primeira.getByText("10 / 12")).toBeInTheDocument();
    expect(primeira.getByText("0 / 8")).toBeInTheDocument();
  });

  it("mostra 'Pessoa removida' quando o nome não é encontrado", async () => {
    abrir(ranking.slice(0, 2), [id(2)]);

    expect(await screen.findByRole("link", { name: "Maria Souza" })).toBeInTheDocument();
    expect(await screen.findByText("Pessoa removida")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Rafael Lima" })).not.toBeInTheDocument();
  });

  it("mostra o estado vazio quando ninguém concluiu", async () => {
    abrir([]);

    expect(await screen.findByText("Ninguém concluiu um quebra-cabeça ainda.")).toBeInTheDocument();
  });

  it("oferece tentar de novo quando o ranking falha", async () => {
    renderizar(<PaginaRankingGamificacao />, { sessao: perfilAdmin });
    servidor.use(
      http.get("*/api/admin/gamificacao/ranking", () => new HttpResponse(null, { status: 500 })),
    );

    expect(
      await screen.findByRole("button", { name: "Tentar novamente" }, { timeout: 4000 }),
    ).toBeInTheDocument();
  });

  it("tem o link de volta para o catálogo", async () => {
    abrir([]);

    expect(await screen.findByRole("link", { name: "Voltar para quebra-cabeças" })).toHaveAttribute(
      "href",
      "/admin/quebra-cabecas",
    );
  });
});
