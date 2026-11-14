import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Perfil } from "@/shared/sessao/tipos";
import {
  perfilAprovadoVencido,
  perfilExpirado,
  perfilFiliado,
  perfilIndisponivel,
  perfilNaoFiliado,
  perfilPendente,
  perfilSemVinculo,
} from "@/test/fixtures/pessoas";
import { renderizar } from "@/test/renderizar";

import { SecaoFiliacao } from "./SecaoFiliacao";

function renderizarSecao(perfil: Perfil) {
  renderizar(<SecaoFiliacao perfil={perfil} />, { sessao: perfil });
  return within(screen.getByRole("region", { name: "Filiação PMI" }));
}

const botaoFiliar = { name: /Quero me filiar/ };

afterEach(() => {
  window.location.hash = "";
  vi.restoreAllMocks();
});

describe("Seção Filiação PMI", () => {
  it("mostra os dados do Filiado, sem o botão de filiação", () => {
    const secao = renderizarSecao(perfilFiliado);

    expect(secao.getByText("Filiado PMI-DF")).toBeInTheDocument();
    expect(secao.getByText("PMI ID: 1000001")).toBeInTheDocument();
    expect(secao.getByText("Filiação válida até")).toBeInTheDocument();
    expect(secao.getByText("31/03/2027")).toBeInTheDocument();
    expect(secao.getByText("Última verificação")).toBeInTheDocument();
    expect(secao.queryByRole("link", botaoFiliar)).not.toBeInTheDocument();
  });

  it("explica a não localização com PMI ID e botão de filiação", () => {
    const secao = renderizarSecao(perfilPendente);

    expect(secao.getByText("Aguardando localização na base do PMI")).toBeInTheDocument();
    expect(secao.getByText("PMI ID: 9999999")).toBeInTheDocument();
    expect(secao.getByText(/Ainda não localizamos sua filiação/)).toBeInTheDocument();
    expect(secao.getByRole("link", botaoFiliar)).toBeInTheDocument();
  });

  it("explica a indisponibilidade do PMI", () => {
    const secao = renderizarSecao(perfilIndisponivel);

    expect(secao.getByText("Aguardando verificação")).toBeInTheDocument();
    expect(secao.getByText(/Não conseguimos consultar o PMI/)).toBeInTheDocument();
  });

  it.each([
    ["EXPIRADO", perfilExpirado],
    ["APROVADO fora da validade", perfilAprovadoVencido],
  ])("mostra %s como vencida, com o link de renovação", (_, perfil) => {
    const secao = renderizarSecao(perfil);

    expect(secao.getByText("Filiação vencida em 30/09/2026")).toBeInTheDocument();
    const renovar = secao.getByRole("link", { name: /Renovar no PMI/ });
    expect(renovar).toHaveAttribute("href", "https://www.pmi.org");
    expect(renovar).toHaveAttribute("target", "_blank");
  });

  it.each([
    ["filiacao nula", perfilNaoFiliado],
    ["SEM_VINCULO", perfilSemVinculo],
  ])("mostra não vinculado e o botão de filiação com %s", (_, perfil) => {
    const secao = renderizarSecao(perfil);

    expect(secao.getByText("Não vinculado")).toBeInTheDocument();
    expect(secao.getByRole("link", botaoFiliar)).toBeInTheDocument();
  });

  it("rola até a seção e foca o título ao chegar por #filiacao", () => {
    const rolar = vi.spyOn(Element.prototype, "scrollIntoView");
    window.location.hash = "#filiacao";

    renderizarSecao(perfilFiliado);

    expect(screen.getByRole("heading", { name: "Filiação PMI" })).toHaveFocus();
    expect(rolar).toHaveBeenCalledOnce();
  });

  it("não mexe no foco sem a âncora", () => {
    const rolar = vi.spyOn(Element.prototype, "scrollIntoView");

    renderizarSecao(perfilFiliado);

    expect(screen.getByRole("heading", { name: "Filiação PMI" })).not.toHaveFocus();
    expect(rolar).not.toHaveBeenCalled();
  });
});
