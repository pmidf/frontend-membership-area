import type { QueryClient } from "@tanstack/react-query";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { describe, expect, it } from "vitest";

import { URL_FILIACAO } from "@/shared/lib/links-externos";
import { chavesSessao } from "@/shared/sessao/sessao.api";
import { perfilNaoFiliado } from "@/test/fixtures/pessoas";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { BloqueioSecao } from "./BloqueioSecao";
import { BotaoQueroSerFiliado } from "./BotaoQueroSerFiliado";
import { PainelExclusivoFiliados } from "./PainelExclusivoFiliados";
import { PreviaBloqueada } from "./PreviaBloqueada";
import { SeloExclusivo } from "./SeloExclusivo";

function espionarConversao(status = 204) {
  const corpos: unknown[] = [];
  servidor.use(
    http.post("*/api/conversao/cta", async ({ request }) => {
      corpos.push(await request.json());
      return new HttpResponse(null, { status });
    }),
  );
  return corpos;
}

function evitarNavegacao() {
  document.addEventListener("click", (evento) => evento.preventDefault(), { once: true });
}

async function esperarSessao(clienteConsultas: QueryClient) {
  await waitFor(() => expect(clienteConsultas.getQueryData(chavesSessao.perfil)).toBeDefined());
}

describe("BotaoQueroSerFiliado", () => {
  it("abre a filiação em nova aba e registra a origem quando há sessão", async () => {
    const corpos = espionarConversao();
    const { clienteConsultas } = renderizar(<BotaoQueroSerFiliado origem="BENEFICIOS" />, {
      sessao: perfilNaoFiliado,
    });

    const link = screen.getByRole("link", { name: /Quero ser filiado/ });
    expect(link).toHaveAttribute("href", URL_FILIACAO);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");

    await esperarSessao(clienteConsultas);
    evitarNavegacao();
    await userEvent.click(link);

    await waitFor(() => expect(corpos).toEqual([{ origem: "BENEFICIOS" }]));
  });

  it("não registra sem sessão", async () => {
    const corpos = espionarConversao();
    renderizar(<BotaoQueroSerFiliado origem="VITRINE" />);

    evitarNavegacao();
    await userEvent.click(screen.getByRole("link", { name: /Quero ser filiado/ }));

    await new Promise((resolver) => setTimeout(resolver, 50));
    expect(corpos).toEqual([]);
  });

  it("não registra sem origem e ignora falha no registro", async () => {
    const corpos = espionarConversao(500);
    const { rerender, clienteConsultas } = renderizar(
      <BotaoQueroSerFiliado rotulo="Quero me filiar" />,
      { sessao: perfilNaoFiliado },
    );
    await esperarSessao(clienteConsultas);

    evitarNavegacao();
    await userEvent.click(screen.getByRole("link", { name: /Quero me filiar/ }));
    expect(corpos).toEqual([]);

    rerender(<BotaoQueroSerFiliado origem="CONTEUDO" />);
    evitarNavegacao();
    await userEvent.click(screen.getByRole("link", { name: /Quero ser filiado/ }));

    await waitFor(() => expect(corpos).toEqual([{ origem: "CONTEUDO" }]));
    expect(screen.getByRole("link", { name: /Quero ser filiado/ })).toBeInTheDocument();
  });
});

describe("PainelExclusivoFiliados", () => {
  it("leva 'Já sou filiado' ao perfil quando logado", async () => {
    renderizar(
      <PainelExclusivoFiliados
        descricao="Filie-se ao PMI-DF para ter acesso ao clube de benefícios."
        origem="BENEFICIOS"
      />,
      { sessao: perfilNaoFiliado },
    );

    const painel = screen.getByRole("region", { name: "Exclusivo para filiados" });
    expect(painel).toHaveTextContent("Filie-se ao PMI-DF para ter acesso ao clube de benefícios.");
    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Já sou filiado" })).toHaveAttribute(
        "href",
        "/perfil#filiacao",
      ),
    );
  });

  it("leva 'Já sou filiado' ao login para o visitante e pode omitir o link", async () => {
    const { rerender } = renderizar(<PainelExclusivoFiliados descricao="Prévia" />);

    await waitFor(() =>
      expect(screen.getByRole("link", { name: "Já sou filiado" })).toHaveAttribute(
        "href",
        "/login",
      ),
    );

    rerender(<PainelExclusivoFiliados descricao="Prévia" mostrarJaSouFiliado={false} />);
    expect(screen.queryByRole("link", { name: "Já sou filiado" })).not.toBeInTheDocument();
  });
});

describe("PreviaBloqueada", () => {
  type Item = { id: string; titulo: string; bloqueado: boolean };
  const itens: Item[] = [
    { id: "1", titulo: "Vídeo público", bloqueado: false },
    { id: "2", titulo: "Vídeo exclusivo", bloqueado: true },
  ];

  it("torna inertes e oculta apenas os itens bloqueados, com resumo acessível", () => {
    renderizar(
      <PreviaBloqueada
        itens={itens}
        chave={(item) => item.id}
        resumoAcessivel="1 conteúdo exclusivo para filiados"
        renderizarItem={(item) => <a href={`/conteudos/${item.id}`}>{item.titulo}</a>}
      />,
    );

    expect(screen.getByText("1 conteúdo exclusivo para filiados")).toHaveClass("sr-only");
    expect(screen.getByRole("link", { name: "Vídeo público" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Vídeo exclusivo" })).not.toBeInTheDocument();
    const bloqueado = screen.getByText("Vídeo exclusivo").closest("[data-bloqueado]");
    expect(bloqueado).toHaveAttribute("inert");
    expect(bloqueado).toHaveAttribute("aria-hidden", "true");
  });

  it("não mostra o resumo quando nada está bloqueado", () => {
    renderizar(
      <PreviaBloqueada
        itens={[itens[0]]}
        chave={(item) => item.id}
        resumoAcessivel="Resumo"
        renderizarItem={(item) => <span>{item.titulo}</span>}
      />,
    );

    expect(screen.queryByText("Resumo")).not.toBeInTheDocument();
  });
});

describe("BloqueioSecao e SeloExclusivo", () => {
  it("desfoca o conteúdo e oferece a filiação", () => {
    renderizar(
      <>
        <BloqueioSecao
          titulo="Filie-se para começar a colecionar peças"
          descricao="Cada presença confirmada em um evento vira 1 crédito."
        >
          <p>Tabuleiro</p>
        </BloqueioSecao>
        <SeloExclusivo />
      </>,
    );

    const secao = screen.getByRole("region", { name: "Conteúdo bloqueado" });
    expect(secao).toHaveTextContent("Filie-se para começar a colecionar peças");
    expect(screen.getByRole("link", { name: /Quero me filiar/ })).toBeInTheDocument();
    expect(screen.getByText("Tabuleiro").parentElement).toHaveAttribute("inert");
    expect(screen.getByText("Exclusivo para filiados")).toBeInTheDocument();
  });
});
