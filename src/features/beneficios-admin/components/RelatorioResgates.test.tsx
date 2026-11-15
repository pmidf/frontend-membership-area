import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { perfilAdmin } from "@/test/fixtures/pessoas";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { anoAtual } from "../lib/relatorio-resgates";
import { relatorioResgatesTeste } from "../mocks/beneficios-admin.handlers";
import { RelatorioResgates } from "./RelatorioResgates";

let usuario: ReturnType<typeof userEvent.setup>;
let consultas: { caminho: string; busca: string }[];

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
  consultas = [];
  servidor.events.on("request:start", ({ request }) => {
    const url = new URL(request.url);
    if (url.pathname.includes("/relatorio"))
      consultas.push({ caminho: url.pathname, busca: url.search });
  });
});

afterEach(() => {
  servidor.events.removeAllListeners();
  vi.restoreAllMocks();
});

const ANO = anoAtual();
const ESPERA = 4000;

function abrir() {
  return renderizar(<RelatorioResgates />, { sessao: perfilAdmin });
}

const tabelaDoAno = (ano: number) =>
  screen.findByRole("table", { name: `Resgates por benefício em ${ano}` });

const avisos = () => within(screen.getByRole("region", { name: "Avisos" }));

function linhasDe(tabela: HTMLElement) {
  return within(tabela)
    .getAllByRole("row")
    .slice(1)
    .map((linha) =>
      within(linha)
        .getAllByRole("cell")
        .map((celula) => celula.textContent),
    );
}

describe("Relatório de resgates (US-04.08)", { timeout: 15_000 }, () => {
  it("mostra a taxa de utilização e a tabela por benefício do ano atual (CA1)", async () => {
    abrir();

    const secao = screen.getByRole("region", { name: "Relatório de resgates" });
    expect(
      within(secao).getByText(
        "Use estes números na renegociação com os parceiros. A exportação sai pseudonimizada e fica registrada na auditoria.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Ano" })).toHaveValue(String(ANO));

    const tabela = await tabelaDoAno(ANO);
    const esperado = relatorioResgatesTeste(ANO);
    const [primeira, segunda, sem] = esperado.por_beneficio;
    expect(linhasDe(tabela)).toEqual([
      [
        primeira.titulo,
        primeira.parceiro,
        String(primeira.resgates),
        String(primeira.filiados_distintos),
      ],
      [
        segunda.titulo,
        segunda.parceiro,
        String(segunda.resgates),
        String(segunda.filiados_distintos),
      ],
      [sem.titulo, sem.parceiro, "0", "0"],
    ]);
    expect(screen.getByText("Taxa de utilização sobre a base ativa")).toBeInTheDocument();
    expect(consultas[0]).toEqual({
      caminho: "/api/admin/beneficios/relatorio",
      busca: `?ano=${ANO}`,
    });
  });

  it("escreve a frase da taxa com os números do backend", async () => {
    servidor.use(
      http.get("*/api/admin/beneficios/relatorio", () =>
        HttpResponse.json({
          ano: ANO,
          total_resgates: 1318,
          filiados_ativos: 1250,
          filiados_distintos: 205,
          taxa: 0.164,
          por_beneficio: [],
        }),
      ),
    );
    abrir();

    expect(
      await screen.findByText(
        `1.318 resgates de 1.250 filiados ativos em ${ANO}. 205 filiados distintos resgataram ao menos uma vantagem, o equivalente a 16,4% da base.`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(`Nenhum resgate em ${ANO}`)).toBeInTheDocument();
  });

  it("usa o singular quando há um só resgate e um só filiado", async () => {
    servidor.use(
      http.get("*/api/admin/beneficios/relatorio", () =>
        HttpResponse.json({
          ano: ANO,
          total_resgates: 1,
          filiados_ativos: 1,
          filiados_distintos: 1,
          taxa: 1,
          por_beneficio: [],
        }),
      ),
    );
    abrir();

    expect(
      await screen.findByText(
        `1 resgate de 1 filiado ativo em ${ANO}. 1 filiado distinto resgatou ao menos uma vantagem, o equivalente a 100% da base.`,
      ),
    ).toBeInTheDocument();
  });

  it("recalcula os números ao escolher outro ano (CA2)", async () => {
    abrir();
    await tabelaDoAno(ANO);

    await usuario.selectOptions(screen.getByRole("combobox", { name: "Ano" }), String(ANO - 1));

    const tabela = await tabelaDoAno(ANO - 1);
    const anterior = relatorioResgatesTeste(ANO - 1);
    await waitFor(() =>
      expect(linhasDe(tabela)[0][2]).toBe(String(anterior.por_beneficio[0].resgates)),
    );
    expect(consultas.at(-1)).toEqual({
      caminho: "/api/admin/beneficios/relatorio",
      busca: `?ano=${ANO - 1}`,
    });
  });

  it("oferece os anos de 2020 até o atual, do mais recente ao mais antigo", () => {
    abrir();

    const opcoes = within(screen.getByRole("combobox", { name: "Ano" }))
      .getAllByRole("option")
      .map((opcao) => opcao.textContent);
    expect(opcoes[0]).toBe(String(ANO));
    expect(opcoes.at(-1)).toBe("2020");
    expect(opcoes).toHaveLength(ANO - 2020 + 1);
  });

  it("exporta o CSV pseudonimizado do ano escolhido (CA3)", async () => {
    let nomeBaixado = "";
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      nomeBaixado = this.download;
    });
    abrir();
    await tabelaDoAno(ANO);
    await usuario.selectOptions(screen.getByRole("combobox", { name: "Ano" }), String(ANO - 1));

    await usuario.click(
      screen.getByRole("button", { name: `Exportar CSV do relatório de resgates de ${ANO - 1}` }),
    );

    expect(await avisos().findByText("Relatório exportado")).toBeInTheDocument();
    expect(consultas).toContainEqual({
      caminho: "/api/admin/beneficios/relatorio.csv",
      busca: `?ano=${ANO - 1}`,
    });
    expect(nomeBaixado).toBe(`relatorio-resgates-${ANO - 1}.csv`);
  });

  it("avisa quando a exportação falha", async () => {
    servidor.use(
      http.get("*/api/admin/beneficios/relatorio.csv", () =>
        HttpResponse.json({}, { status: 500 }),
      ),
    );
    abrir();
    await tabelaDoAno(ANO);

    await usuario.click(screen.getByRole("button", { name: /^Exportar CSV/ }));

    expect(
      await avisos().findByText("Não foi possível exportar o relatório. Tente novamente."),
    ).toBeInTheDocument();
  });

  it("mostra o erro e tenta de novo quando o relatório não carrega", async () => {
    let falhar = true;
    servidor.use(
      http.get("*/api/admin/beneficios/relatorio", () =>
        falhar
          ? HttpResponse.json({}, { status: 500 })
          : HttpResponse.json(relatorioResgatesTeste(ANO)),
      ),
    );
    abrir();

    expect(
      await screen.findByText(
        "Não foi possível carregar o relatório de resgates.",
        {},
        { timeout: ESPERA },
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Taxa de utilização sobre a base ativa")).toBeNull();
    falhar = false;

    await usuario.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await tabelaDoAno(ANO)).toBeInTheDocument();
  });
});
