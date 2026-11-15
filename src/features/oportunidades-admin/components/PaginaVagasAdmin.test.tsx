import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { perfilAdmin } from "@/test/fixtures/pessoas";
import { definirNavegacao, roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import {
  handlersOportunidadesAdmin,
  ID_DUPLICADA,
  oportunidadeEncerrada,
  oportunidadePublicada,
  oportunidadeRascunho,
  oportunidadesAdminTeste,
} from "../mocks/oportunidades-admin.handlers";
import type { OportunidadeAdmin } from "../tipos/oportunidade-admin";
import { PaginaVagasAdmin } from "./PaginaVagasAdmin";

const ESPERA = 4000;

let usuario: ReturnType<typeof userEvent.setup>;
let consultas: string[];
let escritas: { caminho: string; corpo: unknown }[];

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
  consultas = [];
  escritas = [];
  servidor.events.on("request:start", async ({ request }) => {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/admin/oportunidades")) return;
    if (request.method === "GET") {
      if (url.pathname === "/api/admin/oportunidades") consultas.push(url.search);
      return;
    }
    const texto = await request.clone().text();
    escritas.push({ caminho: url.pathname, corpo: texto && JSON.parse(texto) });
  });
});

afterEach(() => servidor.events.removeAllListeners());

async function abrir(consulta = "", vagas: OportunidadeAdmin[] = oportunidadesAdminTeste) {
  definirNavegacao("/admin/vagas", consulta);
  renderizar(<PaginaVagasAdmin />, { sessao: perfilAdmin });
  servidor.use(...handlersOportunidadesAdmin(vagas));
  await screen.findByRole("heading", { level: 1, name: "Gerenciar vagas" });
}

const tabela = () => screen.findByRole("table", { name: "Vagas cadastradas" }, { timeout: ESPERA });
const linhaDe = (titulo: string) => {
  const linha = screen.getByRole("link", { name: titulo }).closest("tr");
  if (!linha) throw new Error(`Linha de ${titulo} não encontrada`);
  return within(linha);
};
const avisos = () => within(screen.getByRole("region", { name: "Avisos" }));

describe("Gerenciar vagas", { timeout: 15_000 }, () => {
  it("lista as vagas com datas, status e as ações de cada situação", async () => {
    await abrir();
    await tabela();

    const publicada = linhaDe(oportunidadePublicada.titulo);
    expect(publicada.getByText("Presencial")).toBeInTheDocument();
    expect(publicada.getByText("11/11/2026")).toBeInTheDocument();
    expect(publicada.getByText("10/01/2027")).toBeInTheDocument();
    expect(publicada.getByText("Publicada")).toBeInTheDocument();
    expect(
      publicada.getByRole("button", { name: `Encerrar ${oportunidadePublicada.titulo}` }),
    ).toBeInTheDocument();
    expect(
      publicada.getByRole("link", { name: `Editar ${oportunidadePublicada.titulo}` }),
    ).toHaveAttribute("href", `/admin/vagas/${oportunidadePublicada.id_oportunidade}`);

    const rascunho = linhaDe(oportunidadeRascunho.titulo);
    expect(rascunho.getAllByText("—")).toHaveLength(2);
    expect(
      rascunho.getByRole("button", { name: `Publicar ${oportunidadeRascunho.titulo}` }),
    ).toBeInTheDocument();
    expect(rascunho.queryByRole("button", { name: /Encerrar/ })).toBeNull();

    const encerrada = linhaDe(oportunidadeEncerrada.titulo);
    expect(encerrada.getByText("—")).toBeInTheDocument();
    expect(encerrada.getAllByRole("button")).toHaveLength(1);
    expect(encerrada.queryByRole("link", { name: /Editar/ })).toBeNull();
    expect(screen.getByRole("link", { name: "+ Nova vaga" })).toHaveAttribute(
      "href",
      "/admin/vagas/nova",
    );
  });

  it("filtra por status pela URL e consulta o backend com a situação", async () => {
    await abrir();
    await tabela();

    await usuario.click(screen.getByRole("button", { name: "Rascunho" }));

    expect(roteadorFalso.replace).toHaveBeenCalledWith("/admin/vagas?situacao=RASCUNHO", {
      scroll: false,
    });
  });

  it("usa os filtros da URL na consulta e mostra o chip ativo", async () => {
    await abrir("situacao=ENCERRADA&q=portf");
    await tabela();

    expect(consultas).toContain("?q=portf&situacao=ENCERRADA");
    expect(screen.getByRole("button", { name: "Encerrada" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("link", { name: oportunidadeEncerrada.titulo })).toHaveAttribute(
      "href",
      `/admin/vagas/${oportunidadeEncerrada.id_oportunidade}?situacao=ENCERRADA&q=portf`,
    );
  });

  it("busca por texto e volta para a primeira página", async () => {
    await abrir("pagina=2");
    await tabela();

    await usuario.type(screen.getByLabelText("Buscar por título ou empresa"), "PMO{Enter}");

    await waitFor(() =>
      expect(roteadorFalso.replace).toHaveBeenCalledWith("/admin/vagas?q=PMO", { scroll: false }),
    );
  });

  it("pagina a lista", async () => {
    await abrir();
    await tabela();

    await usuario.click(screen.getByRole("button", { name: /próxima/i }));

    expect(roteadorFalso.replace).toHaveBeenCalledWith("/admin/vagas?pagina=2", { scroll: false });
  });

  it("publica um rascunho direto da lista", async () => {
    await abrir();
    await tabela();

    await usuario.click(
      linhaDe(oportunidadeRascunho.titulo).getByRole("button", {
        name: `Publicar ${oportunidadeRascunho.titulo}`,
      }),
    );

    expect(await avisos().findByText("Vaga publicada")).toBeInTheDocument();
    expect(escritas.map(({ caminho }) => caminho)).toEqual([
      `/api/admin/oportunidades/${oportunidadeRascunho.id_oportunidade}/publicar`,
    ]);
    await waitFor(() =>
      expect(linhaDe(oportunidadeRascunho.titulo).getByText("Publicada")).toBeInTheDocument(),
    );
  });

  it("encerra com motivo opcional depois de confirmar", async () => {
    await abrir();
    await tabela();

    await usuario.click(
      linhaDe(oportunidadePublicada.titulo).getByRole("button", {
        name: `Encerrar ${oportunidadePublicada.titulo}`,
      }),
    );
    const dialogo = screen.getByRole("dialog", { name: "Encerrar vaga?" });
    expect(within(dialogo).getByText(/sai do mural dos filiados/)).toBeInTheDocument();
    await usuario.type(
      within(dialogo).getByLabelText("Motivo do encerramento (opcional)"),
      "Vaga preenchida",
    );
    await usuario.click(within(dialogo).getByRole("button", { name: "Encerrar vaga" }));

    expect(await avisos().findByText("Vaga encerrada")).toBeInTheDocument();
    expect(escritas).toEqual([
      {
        caminho: `/api/admin/oportunidades/${oportunidadePublicada.id_oportunidade}/encerrar`,
        corpo: { motivo_encerramento: "Vaga preenchida" },
      },
    ]);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("cancela o encerramento sem chamar o backend", async () => {
    await abrir();
    await tabela();

    await usuario.click(
      linhaDe(oportunidadePublicada.titulo).getByRole("button", {
        name: `Encerrar ${oportunidadePublicada.titulo}`,
      }),
    );
    await usuario.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(escritas).toHaveLength(0);
  });

  it("avisa quando o backend recusa encerrar uma vaga que não está publicada", async () => {
    await abrir();
    await tabela();
    servidor.use(
      http.post("*/api/admin/oportunidades/:id/encerrar", () =>
        HttpResponse.json({ codigo: "OPORTUNIDADE_NAO_PUBLICADA" }, { status: 409 }),
      ),
    );

    await usuario.click(
      linhaDe(oportunidadePublicada.titulo).getByRole("button", {
        name: `Encerrar ${oportunidadePublicada.titulo}`,
      }),
    );
    await usuario.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Encerrar vaga" }),
    );

    expect(
      await avisos().findByText("Só vagas publicadas podem ser encerradas."),
    ).toBeInTheDocument();
  });

  it("duplica e leva para a edição do novo rascunho", async () => {
    await abrir();
    await tabela();

    await usuario.click(
      linhaDe(oportunidadeEncerrada.titulo).getByRole("button", {
        name: `Duplicar ${oportunidadeEncerrada.titulo}`,
      }),
    );

    await waitFor(() =>
      expect(roteadorFalso.push).toHaveBeenCalledWith(`/admin/vagas/${ID_DUPLICADA}`),
    );
    expect(avisos().getByText("Rascunho criado")).toBeInTheDocument();
  });

  it("mostra vazio com limpar filtros quando nada corresponde", async () => {
    await abrir("q=inexistente");

    expect(
      await screen.findByText("Nenhuma vaga encontrada", {}, { timeout: ESPERA }),
    ).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Limpar filtros" }));

    expect(roteadorFalso.replace).toHaveBeenCalledWith("/admin/vagas", { scroll: false });
  });

  it("mostra vazio sem filtros quando não há vagas", async () => {
    await abrir("", []);

    expect(
      await screen.findByText("Nenhuma vaga cadastrada", {}, { timeout: ESPERA }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Limpar filtros" })).toBeNull();
  });

  it("mostra erro com tentar de novo", async () => {
    definirNavegacao("/admin/vagas");
    renderizar(<PaginaVagasAdmin />, { sessao: perfilAdmin });
    servidor.use(
      http.get("*/api/admin/oportunidades", () => HttpResponse.json({}, { status: 500 })),
    );

    expect(
      await screen.findByText("Não foi possível carregar as vagas.", {}, { timeout: ESPERA }),
    ).toBeInTheDocument();
  });
});
