import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { Perfil } from "@/shared/sessao/tipos";
import { TOKEN_TESTE } from "@/test/handlers-sessao";
import { perfilNaoFiliado } from "@/test/fixtures/pessoas";
import { definirNavegacao, roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { handlersBeneficios, previaTeste } from "../mocks/beneficios.handlers";
import type { RespostaBeneficios } from "../tipos/beneficio";
import { ImagemBeneficio } from "./ImagemBeneficio";
import { PaginaBeneficios } from "./PaginaBeneficios";
import { PaginaDetalheBeneficio } from "./PaginaDetalheBeneficio";

let consultas: (string | null)[];
let cliques: unknown[];

beforeEach(() => {
  consultas = [];
  cliques = [];
  servidor.events.on("request:start", async ({ request }) => {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/beneficios") consultas.push(request.headers.get("Authorization"));
    if (pathname === "/api/conversao/cta") cliques.push(await request.clone().json());
  });
});

afterEach(() => servidor.events.removeAllListeners());

function abrir(sessao: Perfil | null, resposta?: RespostaBeneficios) {
  const resultado = renderizar(<PaginaBeneficios />, { sessao });
  servidor.use(...handlersBeneficios(resposta));
  return resultado;
}

const cartoes = (recipiente: HTMLElement) =>
  Array.from(recipiente.querySelectorAll("[data-bloqueado='true']"));
const painel = () => screen.findByRole("region", { name: "Exclusivo para filiados" });

describe("Prévia do clube", () => {
  it("mostra ao Não-Filiado o painel e a grade só com as imagens", async () => {
    const { container } = abrir(perfilNaoFiliado);

    await painel();
    expect(cartoes(container)).toHaveLength(6);
    expect(screen.getByText(/^18 vantagens ativas, negociadas pelo capítulo/)).toBeInTheDocument();
    expect(screen.getByText("18 benefícios disponíveis para filiados")).toHaveClass("sr-only");
    expect(consultas).toEqual([`Bearer ${TOKEN_TESTE}`]);
  });

  it("espera a sessão antes de consultar, para não buscar sem o token", async () => {
    abrir(perfilNaoFiliado);

    await painel();
    expect(consultas.every((autorizacao) => autorizacao !== null)).toBe(true);
  });

  it("mostra a prévia ao visitante, sem registrar o clique no botão de filiação", async () => {
    const { container } = abrir(null);

    await painel();
    expect(cartoes(container)).toHaveLength(6);
    expect(consultas).toEqual([null]);

    const botao = screen.getByRole("link", { name: /Quero ser filiado/ });
    botao.addEventListener("click", (evento) => evento.preventDefault());
    await userEvent.click(botao);
    expect(cliques).toEqual([]);
  });

  it("registra a origem do clique quando há sessão", async () => {
    abrir(perfilNaoFiliado);
    await painel();

    const botao = screen.getByRole("link", { name: /Quero ser filiado/ });
    botao.addEventListener("click", (evento) => evento.preventDefault());
    await userEvent.click(botao);

    await waitFor(() => expect(cliques).toEqual([{ origem: "BENEFICIOS" }]));
  });

  it("deixa os cartões inertes e os filtros desabilitados", async () => {
    const { container } = abrir(perfilNaoFiliado);
    await painel();

    cartoes(container).forEach((cartao) => expect(cartao).toHaveAttribute("inert"));
    expect(screen.getByRole("searchbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Todas" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Carreira" })).toBeDisabled();
    expect(screen.getByText("Disponível para filiados")).toBeInTheDocument();
  });

  it("usa o singular com um benefício", async () => {
    abrir(perfilNaoFiliado, { total: 1, itens: previaTeste.itens.slice(0, 1) });

    expect(await screen.findByText(/^1 vantagem ativa, negociada pelo/)).toBeInTheDocument();
  });

  it("mantém o painel e avisa quando não há benefícios", async () => {
    abrir(perfilNaoFiliado, { total: 0, itens: [] });

    expect(await screen.findByText("Novos benefícios em breve.")).toBeInTheDocument();
    expect(await painel()).toBeInTheDocument();
  });

  it("mostra o erro e tenta de novo", async () => {
    let falhar = true;
    abrir(null);
    servidor.use(
      http.get("*/api/beneficios", () =>
        falhar ? HttpResponse.json({}, { status: 500 }) : HttpResponse.json(previaTeste),
      ),
    );

    expect(await screen.findByText("Não foi possível carregar os benefícios.")).toBeInTheDocument();
    falhar = false;
    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await painel()).toBeInTheDocument();
  });
});

describe("Detalhe para quem não é Filiado", () => {
  it("volta para a prévia quando a API exige filiação", async () => {
    definirNavegacao("/beneficios/x", "", { id: "x" });
    renderizar(<PaginaDetalheBeneficio />, { sessao: perfilNaoFiliado });
    servidor.use(
      http.get("*/api/beneficios/:id", () =>
        HttpResponse.json({ codigo: "FILIACAO_NECESSARIA" }, { status: 403 }),
      ),
    );

    await waitFor(() => expect(roteadorFalso.replace).toHaveBeenCalledWith("/beneficios"));
  });
});

describe("ImagemBeneficio", () => {
  it("mantém o fundo de reserva quando a imagem falha", () => {
    const { container } = renderizar(<ImagemBeneficio src="https://exemplo.test/x.png" />);

    fireEvent.error(container.querySelector("img")!);

    expect(container.querySelector("img")).toBeNull();
  });
});
