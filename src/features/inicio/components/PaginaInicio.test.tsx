import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { eventosTeste, handlersAgenda } from "@/features/agenda/mocks/agenda.handlers";
import { PaginaBeneficios } from "@/features/beneficios/components/PaginaBeneficios";
import {
  handlersBeneficios,
  handlersCatalogo,
  handlersResgates,
  historicoTeste,
  itensTeste,
} from "@/features/beneficios/mocks/beneficios.handlers";
import {
  catalogoFiliado,
  catalogoPrevia,
  handlersConteudos,
  itemBloqueado,
  materialNovo,
} from "@/features/conteudos/mocks/conteudos.handlers";
import { handlersGamificacao } from "@/features/gamificacao/mocks/gamificacao.handlers";
import type { Perfil } from "@/shared/sessao/tipos";
import { perfilFiliado, perfilNaoFiliado } from "@/test/fixtures/pessoas";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { PaginaInicio } from "./PaginaInicio";

let caminhos: string[];

beforeEach(() => {
  caminhos = [];
  servidor.events.on("request:start", ({ request }) => {
    caminhos.push(new URL(request.url).pathname);
  });
});

afterEach(() => servidor.events.removeAllListeners());

function abrir(sessao: Perfil) {
  const resultado = renderizar(<PaginaInicio />, { sessao });
  servidor.use(
    ...handlersAgenda(),
    ...handlersGamificacao(),
    ...handlersResgates(historicoTeste),
    ...(sessao.papeis.filiado
      ? [...handlersCatalogo(), ...handlersConteudos(catalogoFiliado)]
      : [...handlersBeneficios(), ...handlersConteudos(catalogoPrevia)]),
  );
  return resultado;
}

const secao = (nome: string) => screen.findByRole("region", { name: nome });

async function titulosDaSecao(nome: string) {
  const regiao = await secao(nome);
  await waitFor(() => expect(within(regiao).queryByRole("status")).not.toBeInTheDocument());
  return within(regiao)
    .queryAllByRole("heading", { level: 3 })
    .map((titulo) => titulo.textContent);
}

async function valorDoIndicador(rotulo: string, espera = 1000) {
  const lista = await screen.findByRole("list", { name: "Seus números no capítulo" });
  const item = within(lista).getByText(rotulo).closest("li")!;
  await waitFor(() => expect(within(item).queryByRole("status")).not.toBeInTheDocument(), {
    timeout: espera,
  });
  return item.querySelector("p")?.textContent;
}

describe("Início do Filiado", () => {
  it("saúda pelo primeiro nome e mostra a validade da filiação", async () => {
    abrir(perfilFiliado);

    expect(await screen.findByRole("heading", { level: 1, name: "Olá, Maria" })).toBeVisible();
    expect(screen.getByText("Sua filiação ao PMI-DF é válida até 03/2027.")).toBeInTheDocument();
    expect(screen.queryByText("Você está vendo a versão gratuita")).not.toBeInTheDocument();
  });

  it("mostra os três indicadores com os números de cada módulo", async () => {
    abrir(perfilFiliado);

    expect(await valorDoIndicador("Eventos em que você esteve presente")).toBe("1");
    expect(await valorDoIndicador("Quebra-cabeças completos")).toBe("3");
    expect(await valorDoIndicador("Benefícios resgatados")).toBe("3");
    expect(caminhos).toContain("/api/agenda/participacoes/situacao");
  });

  it("destaca os 3 próximos eventos, as 3 primeiras vantagens e os 3 conteúdos mais novos", async () => {
    abrir(perfilFiliado);

    expect(await titulosDaSecao("Próximos eventos")).toEqual([
      "Webinar de Agilidade",
      "Encontro de Gestão de Projetos",
      "Summit do capítulo",
    ]);
    expect(screen.getAllByText(/ · Presencial · Brasília$/, { selector: "p" })).toHaveLength(2);
    expect(await titulosDaSecao("Vantagens do momento")).toEqual(
      itensTeste.slice(0, 3).map(({ titulo }) => titulo),
    );
    const conteudos = await titulosDaSecao("Conteúdo exclusivo recente");
    expect(conteudos).toHaveLength(3);
    expect(conteudos[0]).toBe(materialNovo.titulo);
  });

  it("leva cada seção à página completa do módulo", async () => {
    abrir(perfilFiliado);

    expect(await screen.findByRole("link", { name: "Ver agenda completa" })).toHaveAttribute(
      "href",
      "/agenda",
    );
    expect(screen.getByRole("link", { name: "Ver clube de benefícios" })).toHaveAttribute(
      "href",
      "/beneficios",
    );
    expect(screen.getByRole("link", { name: "Ver todo o conteúdo" })).toHaveAttribute(
      "href",
      "/conteudos",
    );
  });

  it("abre o clube de benefícios com os dados que a Home já carregou", async () => {
    const { rerender } = abrir(perfilFiliado);
    await titulosDaSecao("Vantagens do momento");

    rerender(<PaginaBeneficios />);

    expect(screen.queryByRole("status", { name: "Carregando os benefícios…" })).toBeNull();
    expect(screen.getByRole("link", { name: itensTeste[0].titulo })).toBeInTheDocument();
  });

  it("mostra zero presenças sem consultar a situação quando não há eventos encerrados", async () => {
    abrir(perfilFiliado);
    servidor.use(...handlersAgenda(eventosTeste.slice(0, 5)));

    expect(await valorDoIndicador("Eventos em que você esteve presente")).toBe("0");
    expect(caminhos).not.toContain("/api/agenda/participacoes/situacao");
  });

  it("isola a falha de um indicador e permite tentar de novo", async () => {
    abrir(perfilFiliado);
    servidor.use(http.get("*/api/gamificacao", () => new HttpResponse(null, { status: 500 })));

    expect(await valorDoIndicador("Quebra-cabeças completos", 4000)).toBe("—");
    expect(await valorDoIndicador("Benefícios resgatados")).toBe("3");

    servidor.use(...handlersGamificacao());
    const item = screen.getByText("Quebra-cabeças completos").closest("li")!;
    await userEvent.click(within(item).getByRole("button", { name: "Tentar novamente" }));

    await waitFor(() => expect(item.querySelector("p")).toHaveTextContent("3"));
  });

  it("omite a validade quando o perfil não traz a data de expiração", async () => {
    abrir({ ...perfilFiliado, filiacao: null });

    expect(await screen.findByRole("heading", { level: 1, name: "Olá, Maria" })).toBeVisible();
    expect(screen.queryByText(/Sua filiação ao PMI-DF é válida/)).not.toBeInTheDocument();
  });
});

describe("Início do Não-Filiado", () => {
  it("mostra a faixa da versão gratuita e o caminho para conferir a filiação", async () => {
    abrir(perfilNaoFiliado);

    const faixa = await secao("Você está vendo a versão gratuita");
    expect(within(faixa).getByRole("link", { name: /Quero me filiar/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Olá, Rafael" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Meu perfil" })).toHaveAttribute(
      "href",
      "/perfil#filiacao",
    );
    expect(screen.queryByRole("list", { name: "Seus números no capítulo" })).toBeNull();
  });

  it("mostra as vantagens e os conteúdos como prévias bloqueadas", async () => {
    abrir(perfilNaoFiliado);

    const vantagens = await secao("Vantagens que a filiação libera");
    await waitFor(() =>
      expect(vantagens.querySelectorAll("[data-bloqueado='true']")).toHaveLength(3),
    );
    expect(within(vantagens).getAllByText("Código de resgate visível para filiados")).toHaveLength(
      3,
    );
    expect(within(vantagens).getByText("18 benefícios disponíveis para filiados")).toHaveClass(
      "sr-only",
    );
    expect(
      within(vantagens).getByRole("link", { name: "Ver tudo o que está bloqueado" }),
    ).toHaveAttribute("href", "/beneficios");

    expect(await titulosDaSecao("Conteúdo exclusivo")).toEqual([itemBloqueado.titulo]);
    expect(screen.getByText("Reprodução liberada para filiados")).toBeInTheDocument();
  });

  it("não consulta gamificação, resgates nem a situação nos eventos", async () => {
    abrir(perfilNaoFiliado);

    await titulosDaSecao("Próximos eventos");
    await titulosDaSecao("Vantagens que a filiação libera");
    await titulosDaSecao("Conteúdo exclusivo");

    expect(caminhos).toContain("/api/agenda/eventos");
    expect(caminhos.filter((caminho) => caminho.startsWith("/api/gamificacao"))).toEqual([]);
    expect(caminhos).not.toContain("/api/agenda/participacoes/situacao");
    expect(caminhos).not.toContain("/api/me/resgates");
  });
});

describe("Falhas isoladas por seção", () => {
  it("a agenda fora do ar afeta só a seção de eventos, e dá para tentar de novo", async () => {
    abrir(perfilFiliado);
    servidor.use(http.get("*/api/agenda/eventos", () => new HttpResponse(null, { status: 502 })));

    const eventos = await secao("Próximos eventos");
    expect(await within(eventos).findByRole("alert")).toHaveTextContent(
      "A agenda está indisponível no momento.",
    );
    expect(await titulosDaSecao("Vantagens do momento")).toHaveLength(3);
    expect(await titulosDaSecao("Conteúdo exclusivo recente")).toHaveLength(3);
    expect(await valorDoIndicador("Eventos em que você esteve presente")).toBe("—");

    servidor.use(...handlersAgenda());
    await userEvent.click(within(eventos).getByRole("button", { name: "Tentar novamente" }));

    expect(
      await within(eventos).findByRole("link", { name: "Webinar de Agilidade" }),
    ).toBeVisible();
  });

  it("mostra estado vazio quando não há próximos eventos nem benefícios", async () => {
    abrir(perfilFiliado);
    servidor.use(...handlersAgenda(eventosTeste.slice(5)), ...handlersCatalogo([]));

    expect(await screen.findByText("Nenhum evento agendado")).toBeInTheDocument();
    expect(await screen.findByText("Novos benefícios em breve.")).toBeInTheDocument();
  });

  it("monta os destaques num trilho que vira carrossel no mobile", async () => {
    const { container } = abrir(perfilFiliado);
    await titulosDaSecao("Próximos eventos");

    const trilho = container.querySelector("[data-trilho]");
    expect(trilho).toHaveClass("snap-x", "snap-mandatory", "overflow-x-auto", "md:grid");
  });
});
