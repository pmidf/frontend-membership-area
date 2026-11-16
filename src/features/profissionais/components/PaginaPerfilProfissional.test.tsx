import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw/http";
import { describe, expect, it } from "vitest";

import { perfilNaoFiliado } from "@/test/fixtures/pessoas";
import { definirNavegacao } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { camila, diego, handlersProfissionais } from "../mocks/profissionais.handlers";
import { PaginaPerfilProfissional } from "./PaginaPerfilProfissional";

const ESPERA = 4000;

function abrir(id: string, consulta = "") {
  definirNavegacao(`/profissionais/${id}`, consulta, { id });
  renderizar(<PaginaPerfilProfissional />, { sessao: perfilNaoFiliado });
  servidor.use(...handlersProfissionais());
}

describe("Perfil do profissional", { timeout: 15_000 }, () => {
  it("mostra nome, cargo, empresa, local, mini bio com quebras e o LinkedIn em nova aba", async () => {
    abrir(camila.id_pessoa, "uf=DF");

    expect(
      await screen.findByRole(
        "heading",
        { level: 2, name: camila.nome_completo },
        { timeout: ESPERA },
      ),
    ).toBeVisible();
    expect(
      screen.getByText("Gerente de Projetos Sênior · Construtora Vega · Brasília/DF"),
    ).toBeVisible();
    const bio = screen.getByText(/Gerencio obras de infraestrutura urbana\./);
    expect(bio.textContent).toBe(camila.mini_bio);
    expect(bio).toHaveClass("whitespace-pre-line");

    const linkedin = screen.getByRole("link", { name: /Ver no LinkedIn/ });
    expect(linkedin).toHaveAttribute("href", camila.linkedin_url);
    expect(linkedin).toHaveAttribute("target", "_blank");
    expect(linkedin).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText("(abre em nova aba)")).toHaveClass("sr-only");

    expect(screen.getByRole("link", { name: "Voltar para profissionais" })).toHaveAttribute(
      "href",
      "/profissionais?uf=DF",
    );
  });

  it("esconde o LinkedIn e a mini bio quando não existem", async () => {
    abrir(diego.id_pessoa);

    expect(
      await screen.findByRole(
        "heading",
        { level: 2, name: diego.nome_completo },
        { timeout: ESPERA },
      ),
    ).toBeVisible();
    expect(screen.getByRole("img", { name: diego.nome_completo })).toHaveAttribute(
      "src",
      diego.foto_perfil,
    );
    expect(screen.queryByRole("link", { name: /Ver no LinkedIn/ })).toBeNull();
  });

  it("mostra não encontrado quando o profissional saiu da vitrine", async () => {
    abrir("70000000-0000-4000-8000-999999999999");

    expect(
      await screen.findByText(
        "Profissional não encontrado ou não está mais na vitrine",
        {},
        { timeout: ESPERA },
      ),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Ver os profissionais" })).toHaveAttribute(
      "href",
      "/profissionais",
    );
  });

  it("mostra erro com tentar de novo em falha do servidor", async () => {
    definirNavegacao(`/profissionais/${camila.id_pessoa}`, "", { id: camila.id_pessoa });
    renderizar(<PaginaPerfilProfissional />, { sessao: perfilNaoFiliado });
    servidor.use(http.get("*/api/profissionais/:id", () => HttpResponse.json({}, { status: 500 })));

    expect(
      await screen.findByText("Não foi possível carregar o perfil.", {}, { timeout: 8000 }),
    ).toBeVisible();
  });
});
