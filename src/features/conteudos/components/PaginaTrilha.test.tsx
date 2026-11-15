import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { describe, expect, it } from "vitest";

import type { Perfil } from "@/shared/sessao/tipos";
import { perfilFiliado, perfilNaoFiliado } from "@/test/fixtures/pessoas";
import { definirNavegacao } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import {
  handlersTrilhas,
  itemBloqueado,
  materialNovo,
  resumosTrilhas,
  trilhaConcluida,
  trilhaEmAndamento,
  trilhaPrevia,
  videoPublico,
  videoVisto,
} from "../mocks/conteudos.handlers";
import type { DetalheTrilha } from "../tipos/trilha";
import { PaginaTrilha } from "./PaginaTrilha";

function abrir(trilha: DetalheTrilha = trilhaEmAndamento, sessao: Perfil = perfilFiliado, de = "") {
  definirNavegacao(`/conteudos/trilhas/${trilha.id_trilha}`, de, { id: trilha.id_trilha });
  renderizar(<PaginaTrilha />, { sessao });
  servidor.use(...handlersTrilhas(resumosTrilhas, trilha));
}

const origem = (trilha: DetalheTrilha, de = "") =>
  encodeURIComponent(`/conteudos/trilhas/${trilha.id_trilha}${de ? `?${de}` : ""}`);
const itens = () => within(screen.getByRole("list", { name: "Conteúdos na ordem da trilha" }));
const progresso = () =>
  within(screen.getByRole("heading", { name: "Seu progresso" }).parentElement!);

describe("Página da trilha", () => {
  it("mostra a trilha, os itens em ordem e o progresso do Filiado", async () => {
    abrir(trilhaEmAndamento, perfilFiliado, "de=%2Fconteudos%2Ftrilhas");

    expect(
      await screen.findByRole("heading", { level: 1, name: trilhaEmAndamento.titulo }),
    ).toBeInTheDocument();
    expect(screen.getByText("Trilha · 3 itens")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Voltar para o catálogo/ })).toHaveAttribute(
      "href",
      "/conteudos/trilhas",
    );
    const links = itens().getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      expect.stringContaining(videoVisto.titulo),
      expect.stringContaining(videoPublico.titulo),
      expect.stringContaining(materialNovo.titulo),
    ]);
    expect(links[0]).toHaveTextContent("Visto");
    expect(links[1]).toHaveTextContent("Próximo");
    expect(links[2]).toHaveTextContent("Abrir");
    expect(links[1]).toHaveAttribute(
      "href",
      `/conteudos/${videoPublico.id_conteudo}?de=${origem(trilhaEmAndamento, "de=%2Fconteudos%2Ftrilhas")}`,
    );
    expect(progresso().getByText("1 de 3")).toBeInTheDocument();
    expect(progresso().getByRole("link", { name: "Continuar trilha" })).toHaveAttribute(
      "href",
      links[1].getAttribute("href"),
    );
    expect(progresso().queryByRole("link", { name: /Quero me filiar/ })).toBeNull();
  });

  it("mostra os exclusivos sem link e oferece a filiação ao Não-Filiado", async () => {
    abrir(trilhaPrevia, perfilNaoFiliado);

    await screen.findByRole("heading", { level: 1, name: trilhaPrevia.titulo });
    expect(itens().getAllByRole("link")).toHaveLength(1);
    expect(itens().getByText(itemBloqueado.titulo)).toBeInTheDocument();
    expect(itens().getByText("Exclusivo para filiados")).toBeInTheDocument();
    expect(progresso().getByRole("link", { name: "Começar trilha" })).toBeInTheDocument();
    expect(
      progresso().getByText("1 conteúdo desta trilha é exclusivo para filiados."),
    ).toBeInTheDocument();
    expect(progresso().getByRole("link", { name: /Quero me filiar/ })).toBeInTheDocument();
  });

  it("parabeniza quando a trilha foi concluída", async () => {
    abrir(trilhaConcluida);

    expect(await screen.findByText("Você concluiu esta trilha.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /trilha$/ })).toBeNull();
  });

  it("avisa quando a trilha não existe", async () => {
    abrir();
    servidor.use(http.get("*/api/trilhas/:id", () => new HttpResponse(null, { status: 404 })));

    expect(await screen.findByText("Trilha não encontrada")).toBeInTheDocument();
  });

  it("mostra o erro e tenta de novo", async () => {
    abrir();
    servidor.use(http.get("*/api/trilhas/:id", () => HttpResponse.json({}, { status: 500 })));

    expect(
      await screen.findByText("Não foi possível carregar a trilha.", {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    servidor.use(...handlersTrilhas());
    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(
      await screen.findByRole("heading", { level: 1, name: trilhaEmAndamento.titulo }),
    ).toBeInTheDocument();
  });
});
