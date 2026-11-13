import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Perfil } from "@/shared/sessao/tipos";
import { perfilFiliado, perfilNaoFiliado } from "@/test/fixtures/pessoas";
import { definirNavegacao, roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import {
  acessoMaterialTeste,
  detalheBloqueado,
  detalheMaterial,
  detalheVideo,
  handlersDetalhe,
  playerTeste,
} from "../mocks/conteudos.handlers";
import type { DetalheConteudo } from "../tipos/conteudo";
import { PaginaDetalheConteudo } from "./PaginaDetalheConteudo";

let chamadas: string[];

beforeEach(() => {
  chamadas = [];
  servidor.events.on("request:start", ({ request }) => {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith("/api/conteudos")) chamadas.push(`${request.method} ${pathname}`);
  });
});

afterEach(() => {
  servidor.events.removeAllListeners();
  vi.restoreAllMocks();
});

function abrir(detalhe: DetalheConteudo = detalheVideo, sessao: Perfil = perfilFiliado, de = "") {
  definirNavegacao(`/conteudos/${detalhe.id_conteudo}`, de, { id: detalhe.id_conteudo });
  const resultado = renderizar(<PaginaDetalheConteudo />, { sessao });
  servidor.use(...handlersDetalhe(detalhe));
  return resultado;
}

const titulo = (texto: string) => screen.findByRole("heading", { level: 1, name: texto });
const sobreAcesso = () =>
  within(screen.getByRole("heading", { name: "Sobre o acesso" }).parentElement!);

describe("Vídeo exclusivo para o Filiado", () => {
  it("mostra as informações e o player do YouTube em modo de privacidade", async () => {
    abrir();

    await titulo(detalheVideo.titulo);
    const player = await screen.findByTitle(detalheVideo.titulo);
    expect(player).toHaveAttribute("src", playerTeste.embed_url);
    expect(player.getAttribute("src")).toContain("youtube-nocookie.com");
    expect(player).toHaveAttribute("allow", expect.stringContaining("encrypted-media"));
    expect(player).toHaveAttribute("allowfullscreen");
    expect(player).toHaveAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    expect(screen.getByText("Exclusivo filiado")).toBeInTheDocument();
    expect(screen.getByText("Tecnologia")).toBeInTheDocument();
    expect(screen.getByText("42 min · publicado em 22/08/2026")).toBeInTheDocument();
    expect(sobreAcesso().getByText("Conteúdo restrito a filiados")).toBeInTheDocument();
  });

  it("pede o player uma única vez e pela rota exclusiva", async () => {
    abrir();

    await screen.findByTitle(detalheVideo.titulo);
    const players = chamadas.filter((chamada) => chamada.endsWith("/player"));
    expect(players).toEqual([`GET /api/conteudos/${detalheVideo.id_conteudo}/player`]);
  });

  it("marca e desmarca como assistido na hora", async () => {
    abrir();
    await titulo(detalheVideo.titulo);

    await userEvent.click(screen.getByRole("button", { name: "Marcar como assistido" }));
    expect(
      await screen.findByRole("button", { name: "Assistido — desmarcar" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(chamadas).toContain(`PUT /api/conteudos/${detalheVideo.id_conteudo}/consumido`),
    );

    await userEvent.click(screen.getByRole("button", { name: "Assistido — desmarcar" }));
    expect(
      await screen.findByRole("button", { name: "Marcar como assistido" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(chamadas).toContain(`DELETE /api/conteudos/${detalheVideo.id_conteudo}/consumido`),
    );
  });

  it("desfaz a marcação e avisa quando a API falha", async () => {
    abrir();
    await titulo(detalheVideo.titulo);
    servidor.use(
      http.put("*/api/conteudos/:id/consumido", () => HttpResponse.json({}, { status: 500 })),
    );

    await userEvent.click(screen.getByRole("button", { name: "Marcar como assistido" }));

    expect(
      await screen.findByText("Não foi possível atualizar. Tente novamente."),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "Marcar como assistido" }),
    ).toBeInTheDocument();
  });

  it("volta ao catálogo quando o player exige filiação", async () => {
    abrir();
    servidor.use(
      http.get("*/api/conteudos/:id/player", () =>
        HttpResponse.json({ codigo: "FILIACAO_NECESSARIA" }, { status: 403 }),
      ),
    );

    await waitFor(() => expect(roteadorFalso.replace).toHaveBeenCalledWith("/conteudos"));
  });

  it("oferece tentar de novo quando o player falha", async () => {
    abrir();
    servidor.use(
      http.get("*/api/conteudos/:id/player", () => HttpResponse.json({}, { status: 500 })),
    );

    expect(await screen.findByText("Não foi possível carregar o vídeo.")).toBeInTheDocument();
    servidor.use(...handlersDetalhe(detalheVideo));
    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByTitle(detalheVideo.titulo)).toBeInTheDocument();
  });
});

describe("Conteúdo público", () => {
  const publico = { ...detalheVideo, bol_exclusivo: false };

  it.each([
    ["Filiado", perfilFiliado],
    ["Não-Filiado", perfilNaoFiliado],
  ])("usa a rota pública do player para o %s", async (_rotulo, sessao) => {
    abrir(publico, sessao);

    await screen.findByTitle(publico.titulo);
    expect(chamadas.filter((chamada) => chamada.endsWith("/player"))).toEqual([
      `GET /api/conteudos/publicos/${publico.id_conteudo}/player`,
    ]);
    expect(screen.getByText("Público")).toBeInTheDocument();
    expect(sobreAcesso().getByText("Conteúdo aberto")).toBeInTheDocument();
  });

  it("deixa o Não-Filiado marcar como visto", async () => {
    abrir(publico, perfilNaoFiliado);
    await titulo(publico.titulo);

    await userEvent.click(screen.getByRole("button", { name: "Marcar como assistido" }));

    await waitFor(() =>
      expect(chamadas).toContain(`PUT /api/conteudos/${publico.id_conteudo}/consumido`),
    );
  });
});

describe("Acesso e navegação", () => {
  it("volta ao catálogo quando o conteúdo chega bloqueado", async () => {
    abrir(detalheBloqueado, perfilNaoFiliado);

    await waitFor(() => expect(roteadorFalso.replace).toHaveBeenCalledWith("/conteudos"));
    expect(chamadas.some((chamada) => chamada.endsWith("/player"))).toBe(false);
  });

  it("avisa quando o conteúdo não existe", async () => {
    abrir();
    servidor.use(http.get("*/api/conteudos/:id", () => new HttpResponse(null, { status: 404 })));

    expect(await screen.findByText("Conteúdo não encontrado")).toBeInTheDocument();
  });

  it("mostra o erro e tenta de novo", async () => {
    abrir();
    servidor.use(http.get("*/api/conteudos/:id", () => HttpResponse.json({}, { status: 500 })));

    expect(
      await screen.findByText("Não foi possível carregar o conteúdo.", {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    servidor.use(...handlersDetalhe(detalheVideo));
    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    await titulo(detalheVideo.titulo);
  });

  it.each([
    ["de=%2Fconteudos%2Fbiblioteca%3Ftipo%3DVIDEO", "/conteudos/biblioteca?tipo=VIDEO"],
    ["de=%2Fconteudos%2Fhistorico", "/conteudos/historico"],
    ["de=https%3A%2F%2Fmalicioso.test", "/conteudos"],
    ["", "/conteudos"],
  ])("com %s, o link de volta leva a %s", async (de, destino) => {
    abrir(detalheVideo, perfilFiliado, de);

    await titulo(detalheVideo.titulo);
    expect(screen.getByRole("link", { name: /Voltar para o catálogo/ })).toHaveAttribute(
      "href",
      destino,
    );
  });
});

describe("Material", () => {
  function abaFalsa() {
    return { opener: {}, location: { href: "" }, close: vi.fn() };
  }

  it("abre o material em nova aba e registra o acesso", async () => {
    const aba = abaFalsa();
    const abrirJanela = vi.spyOn(window, "open").mockReturnValue(aba as unknown as Window);
    abrir(detalheMaterial);
    await titulo(detalheMaterial.titulo);

    await userEvent.click(screen.getByRole("button", { name: "Abrir material" }));

    await waitFor(() => expect(aba.location.href).toBe(acessoMaterialTeste.url));
    expect(abrirJanela).toHaveBeenCalledWith("", "_blank");
    expect(aba.opener).toBeNull();
    expect(chamadas).toContain(`POST /api/conteudos/${detalheMaterial.id_conteudo}/acessos`);
    expect(screen.getByText("Abre em nova aba")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Marcar como visto" })).toBeInTheDocument();
    expect(chamadas.some((chamada) => chamada.endsWith("/player"))).toBe(false);
  });

  it.each([
    [404, "Material não encontrado."],
    [403, "Material exclusivo para filiados."],
    [500, "Não foi possível abrir o material."],
  ])("fecha a aba e avisa quando a API responde %i", async (status, mensagem) => {
    const aba = abaFalsa();
    vi.spyOn(window, "open").mockReturnValue(aba as unknown as Window);
    abrir(detalheMaterial);
    await titulo(detalheMaterial.titulo);
    servidor.use(http.post("*/api/conteudos/:id/acessos", () => HttpResponse.json({}, { status })));

    await userEvent.click(screen.getByRole("button", { name: "Abrir material" }));

    expect(await screen.findByText(mensagem)).toBeInTheDocument();
    expect(aba.close).toHaveBeenCalled();
  });
});
