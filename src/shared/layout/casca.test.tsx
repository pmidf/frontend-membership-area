import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, describe, expect, it } from "vitest";

import { hojeNoFuso } from "@/shared/lib/datas";
import type { Perfil } from "@/shared/sessao/tipos";
import {
  perfilAdmin,
  perfilExpirado,
  perfilFiliado,
  perfilNaoFiliado,
  perfilPendente,
} from "@/test/fixtures/pessoas";
import { definirNavegacao, roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { avisoDeVencimento } from "./AvisoVencimento";
import { CascaAdmin } from "./CascaAdmin";
import { CascaMembro } from "./CascaMembro";

function vencendoEm(dias: number): Perfil {
  const data = hojeNoFuso(new Date(Date.now() + dias * 86_400_000));
  return {
    ...perfilFiliado,
    filiacao: { ...perfilFiliado.filiacao!, data_expiracao: `${data}T00:00:00.000Z` },
  };
}

function renderizarMembro(sessao: Perfil | null, caminho = "/inicio") {
  definirNavegacao(caminho);
  return renderizar(
    <CascaMembro>
      <h1>Conteúdo da página</h1>
    </CascaMembro>,
    { sessao },
  );
}

const navegacaoMembro = () => screen.getByRole("navigation", { name: "Área do membro" });

function menuDe(gatilho: HTMLElement) {
  return document.getElementById(gatilho.getAttribute("aria-controls")!)!;
}

afterEach(() => sessionStorage.clear());

describe("CascaMembro", () => {
  it("mostra ao Filiado o selo, a validade da filiação e o item ativo", async () => {
    renderizarMembro(perfilFiliado);

    expect(await screen.findByText("Filiação válida até 03/2027")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Maria Souza/ })).toHaveTextContent("Filiado ativo");
    expect(within(navegacaoMembro()).getByRole("link", { name: "Início" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(navegacaoMembro()).getAllByRole("link")).toHaveLength(8);
    expect(screen.getByText("Início", { selector: "header p" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Conteúdo da página");
    expect(screen.queryByRole("link", { name: "Console administrativo" })).not.toBeInTheDocument();
  });

  it("mostra ao Não-Filiado o plano gratuito com o convite à filiação", async () => {
    renderizarMembro(perfilNaoFiliado);

    expect(await screen.findByText("Você está no plano gratuito")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Quero me filiar/ })).toHaveAttribute(
      "target",
      "_blank",
    );
    expect(screen.getAllByText("Não filiado").length).toBeGreaterThan(0);
  });

  it("trata a filiação pendente como Não filiado", async () => {
    renderizarMembro(perfilPendente);

    expect(await screen.findByText("Você está no plano gratuito")).toBeInTheDocument();
    expect(screen.queryByText("Filiado ativo")).not.toBeInTheDocument();
  });

  it("oferece ao visitante entrar ou criar conta", async () => {
    renderizarMembro(null, "/agenda");

    expect(await screen.findByText("Entre para ver sua trilha")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute("href", "/cadastro");
    expect(screen.getAllByRole("link", { name: "Entrar" })).toHaveLength(2);
    expect(screen.getByText("Agenda de eventos", { selector: "header p" })).toBeInTheDocument();
  });

  it("leva o Admin ao console pela barra lateral", async () => {
    renderizarMembro(perfilAdmin);

    expect(await screen.findByRole("link", { name: "Console administrativo" })).toHaveAttribute(
      "href",
      "/admin",
    );
  });

  it("destaca na navegação inferior o item da rota atual, inclusive em subrotas", async () => {
    renderizarMembro(perfilFiliado, "/beneficios/abc");

    const inferior = screen.getByRole("navigation", { name: "Navegação principal" });
    expect(within(inferior).getAllByRole("link")).toHaveLength(5);
    expect(within(inferior).getByRole("link", { name: "Benefícios" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(inferior).getByRole("link", { name: "Início" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("abre a gaveta de navegação e a fecha ao navegar", async () => {
    renderizarMembro(perfilFiliado);
    await screen.findByText("Filiação válida até 03/2027");

    await userEvent.click(screen.getByRole("button", { name: "Abrir navegação" }));
    const gaveta = screen.getByRole("dialog", { name: "Área do membro" });
    await userEvent.click(within(gaveta).getByRole("link", { name: "Vagas" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("MenuPessoa", () => {
  it("lista os itens da conta, fecha com Esc e devolve o foco", async () => {
    renderizarMembro(perfilNaoFiliado);
    const gatilho = await screen.findByRole("button", { name: /Rafael Souza/ });

    await userEvent.click(gatilho);
    expect(gatilho).toHaveAttribute("aria-expanded", "true");
    const menu = within(menuDe(gatilho));
    expect(menu.getByRole("link", { name: "Meu perfil" })).toHaveAttribute("href", "/perfil");
    expect(menu.getByRole("link", { name: "Minhas conquistas" })).toBeInTheDocument();
    expect(menu.queryByRole("link", { name: "Início" })).not.toBeInTheDocument();
    expect(menu.queryByText("Console administrativo")).not.toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    expect(gatilho).toHaveAttribute("aria-expanded", "false");
    expect(gatilho).toHaveFocus();
  });

  it("fecha ao clicar fora", async () => {
    renderizarMembro(perfilNaoFiliado);
    const gatilho = await screen.findByRole("button", { name: /Rafael Souza/ });

    await userEvent.click(gatilho);
    await userEvent.click(screen.getByRole("main"));

    expect(gatilho).toHaveAttribute("aria-expanded", "false");
  });

  it("mostra o console ao Admin e sai encerrando a sessão", async () => {
    let encerrou = false;
    renderizarMembro(perfilAdmin);
    servidor.use(
      http.post("*/api/auth/logout", () => {
        encerrou = true;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const gatilho = await screen.findByRole("button", { name: /Rafael Lima/ });
    await userEvent.click(gatilho);
    expect(
      within(menuDe(gatilho)).getByRole("link", { name: "Console administrativo" }),
    ).toHaveAttribute("href", "/admin");
    await userEvent.click(screen.getByRole("button", { name: "Sair" }));

    await waitFor(() => expect(roteadorFalso.replace).toHaveBeenCalledWith("/login"));
    expect(encerrou).toBe(true);
    expect(roteadorFalso.replace).not.toHaveBeenCalledWith(expect.stringContaining("redirecionar"));
  });
});

describe("AvisoVencimento", () => {
  it("decide o aviso pela janela de 30 dias e pela situação", () => {
    const agora = new Date("2026-11-01T15:00:00.000Z");
    const comData = (data: string, perfil: Perfil = perfilFiliado): Perfil => ({
      ...perfil,
      filiacao: {
        ...perfilFiliado.filiacao!,
        situacao: perfil.filiacao!.situacao,
        data_expiracao: data,
      },
    });

    expect(avisoDeVencimento(comData("2026-12-01"), agora)).toEqual({
      tipo: "vencendo",
      dataExpiracao: "2026-12-01",
    });
    expect(avisoDeVencimento(comData("2026-12-02"), agora)).toBeNull();
    expect(avisoDeVencimento(perfilExpirado, agora)?.tipo).toBe("vencida");
    expect(avisoDeVencimento(perfilNaoFiliado, agora)).toBeNull();
    expect(avisoDeVencimento(null, agora)).toBeNull();
  });

  it("avisa o Filiado a 20 dias do vencimento e respeita a dispensa na sessão", async () => {
    const perfil = vencendoEm(20);
    const { unmount } = renderizarMembro(perfil);

    const aviso = await screen.findByText(/Sua filiação vence em \d{2}\/\d{2}/);
    expect(aviso).toHaveTextContent("renove no PMI para não perder o acesso");
    await userEvent.click(screen.getByRole("button", { name: "Dispensar aviso" }));
    expect(screen.queryByText(/Sua filiação vence em/)).not.toBeInTheDocument();
    unmount();

    renderizarMembro(perfil);
    await screen.findByText(/Filiação válida até/);
    expect(screen.queryByText(/Sua filiação vence em/)).not.toBeInTheDocument();
  });

  it("avisa a filiação vencida com o caminho para atualizar a situação", async () => {
    renderizarMembro(perfilExpirado);

    const aviso = await screen.findByRole("alert");
    expect(aviso).toHaveTextContent("Sua filiação venceu em 30/09.");
    expect(within(aviso).getByRole("link", { name: "Atualizar minha situação" })).toHaveAttribute(
      "href",
      "/perfil#filiacao",
    );
  });
});

describe("CascaAdmin", () => {
  it("mostra a navegação do console e o retorno à área do membro", async () => {
    definirNavegacao("/admin/vagas");
    renderizar(
      <CascaAdmin>
        <h1>Vagas</h1>
      </CascaAdmin>,
      { sessao: perfilAdmin },
    );

    const navegacao = screen.getByRole("navigation", { name: "Console administrativo" });
    expect(within(navegacao).getAllByRole("link")).toHaveLength(6);
    expect(within(navegacao).getByRole("link", { name: "Vagas" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Voltar à área do membro" })).toHaveAttribute(
      "href",
      "/inicio",
    );
    expect(
      screen.queryByRole("navigation", { name: "Navegação principal" }),
    ).not.toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /Rafael Lima/ })).toBeInTheDocument();
  });
});
