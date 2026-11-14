import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { perfilFiliado } from "@/test/fixtures/pessoas";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import type { SessaoAtiva } from "../api/seguranca.api";
import { handlersSeguranca, SENHA_ATUAL_TESTE, sessoesTeste } from "../mocks/seguranca.handlers";
import { SecaoSeguranca } from "./SecaoSeguranca";

let usuario: ReturnType<typeof userEvent.setup>;
const chamadas: string[] = [];

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
  chamadas.length = 0;
  servidor.events.on("request:start", ({ request }) => {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/me/s")) {
      chamadas.push(`${request.method} ${url.pathname}${url.search}`);
    }
  });
});

afterEach(() => servidor.events.removeAllListeners());

function renderizarSecao(sessoes: SessaoAtiva[] = sessoesTeste) {
  const resultado = renderizar(<SecaoSeguranca />, { sessao: perfilFiliado });
  servidor.use(...handlersSeguranca(sessoes));
  return resultado;
}

async function listaSessoes() {
  await screen.findByText("Chrome no Windows");
  return screen.getByRole("list", { name: "Sessões ativas" });
}

const regiaoAvisos = () => screen.getByRole("region", { name: "Avisos" });

describe("Sessões ativas", () => {
  it("lista as sessões com a atual marcada e sem botão de encerrar", async () => {
    renderizarSecao();

    const lista = await listaSessoes();
    const [atual, outra] = within(lista).getAllByRole("listitem");
    expect(atual).toHaveTextContent("Chrome no WindowsEsta sessão");
    expect(within(atual).queryByRole("button")).not.toBeInTheDocument();
    expect(within(atual).getByRole("img", { name: "Computador" })).toBeInTheDocument();
    expect(outra).toHaveTextContent("Chrome no Android");
    expect(outra).toHaveTextContent("189.40.50.60");
    expect(within(outra).getByRole("img", { name: "Celular" })).toBeInTheDocument();
    expect(within(outra).getByText(/^há \d+ dias$/)).toHaveAttribute(
      "title",
      "30/10/2026 às 06:00",
    );
  });

  it("encerra outra sessão depois da confirmação", async () => {
    renderizarSecao();
    await listaSessoes();

    await usuario.click(
      screen.getByRole("button", { name: "Encerrar a sessão Chrome no Android" }),
    );
    const dialogo = screen.getByRole("dialog", { name: "Encerrar sessão?" });
    expect(dialogo).toHaveTextContent("Chrome no Android será desconectado");
    await usuario.click(within(dialogo).getByRole("button", { name: "Encerrar" }));

    await waitFor(() => expect(screen.queryByText("Chrome no Android")).not.toBeInTheDocument());
    expect(await screen.findByText("Sessão encerrada.")).toBeVisible();
    expect(chamadas).toContain(`DELETE /api/me/sessoes/${sessoesTeste[1].id_sessao}`);
  });

  it("atualiza a lista em silêncio quando a sessão já tinha sido encerrada", async () => {
    renderizarSecao();
    await listaSessoes();
    servidor.use(
      http.delete("*/api/me/sessoes/:id", () => new HttpResponse(null, { status: 404 })),
      http.get("*/api/me/sessoes", () => HttpResponse.json([sessoesTeste[0]])),
    );

    await usuario.click(
      screen.getByRole("button", { name: "Encerrar a sessão Chrome no Android" }),
    );
    await usuario.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Encerrar" }),
    );

    await waitFor(() => expect(screen.queryByText("Chrome no Android")).not.toBeInTheDocument());
    expect(regiaoAvisos().textContent).toBe("");
  });

  it("encerra todas as outras com ?outras=true e desabilita o botão quando sobra só a atual", async () => {
    renderizarSecao();
    await listaSessoes();

    await usuario.click(screen.getByRole("button", { name: "Encerrar todas as outras sessões" }));
    const dialogo = screen.getByRole("dialog", { name: "Encerrar todas as outras sessões?" });
    await usuario.click(within(dialogo).getByRole("button", { name: "Encerrar todas" }));

    expect(await screen.findByText("As outras sessões foram encerradas.")).toBeVisible();
    await waitFor(() => expect(screen.queryByText("Chrome no Android")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Encerrar todas as outras sessões" })).toBeDisabled();
    expect(chamadas).toContain("DELETE /api/me/sessoes?outras=true");
  });

  it("mostra o erro com nova tentativa", async () => {
    renderizarSecao();
    servidor.use(http.get("*/api/me/sessoes", () => new HttpResponse(null, { status: 500 })));

    expect(await screen.findByText("Não foi possível carregar suas sessões.")).toBeVisible();
    servidor.use(...handlersSeguranca());
    await usuario.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByText("Chrome no Windows")).toBeVisible();
  });

  it("avisa quando encerrar falha por outro motivo", async () => {
    renderizarSecao();
    await listaSessoes();
    servidor.use(http.delete("*/api/me/sessoes", () => new HttpResponse(null, { status: 500 })));

    await usuario.click(screen.getByRole("button", { name: "Encerrar todas as outras sessões" }));
    await usuario.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Encerrar todas" }),
    );

    expect(
      await within(regiaoAvisos()).findByText("Não foi possível concluir a ação. Tente novamente."),
    ).toBeVisible();
  });
});

describe("Trocar senha", () => {
  async function abrirModal() {
    renderizarSecao();
    await listaSessoes();
    await usuario.click(screen.getByRole("button", { name: "Trocar senha" }));
    return screen.getByRole("dialog", { name: "Trocar senha" });
  }

  async function preencher(dialogo: HTMLElement, atual: string, nova: string, confirmacao = nova) {
    await usuario.type(within(dialogo).getByLabelText("Senha atual"), atual);
    await usuario.type(within(dialogo).getByLabelText("Nova senha"), nova);
    await usuario.type(within(dialogo).getByLabelText("Confirmar nova senha"), confirmacao);
    await usuario.click(within(dialogo).getByRole("button", { name: "Salvar" }));
  }

  it("aponta a senha atual incorreta no campo", async () => {
    const dialogo = await abrirModal();

    await preencher(dialogo, "senha-errada", "NovaSenha2026!");

    expect(await within(dialogo).findByText("A senha atual está incorreta.")).toBeVisible();
    expect(within(dialogo).getByLabelText("Senha atual")).toHaveFocus();
  });

  it("valida localmente sem chamar o backend", async () => {
    const dialogo = await abrirModal();

    await preencher(dialogo, SENHA_ATUAL_TESTE, "NovaSenha2026!", "OutraSenha2026!");

    expect(await within(dialogo).findByText("As senhas não conferem")).toBeVisible();
    expect(chamadas.filter((chamada) => chamada.startsWith("PUT"))).toEqual([]);
  });

  it("troca a senha, fecha o modal, avisa e atualiza as sessões", async () => {
    const dialogo = await abrirModal();
    await usuario.type(within(dialogo).getByLabelText("Nova senha"), "NovaSenha2026!");
    expect(within(dialogo).getByText("Força da senha: forte")).toBeVisible();
    await usuario.clear(within(dialogo).getByLabelText("Nova senha"));

    await preencher(dialogo, SENHA_ATUAL_TESTE, "NovaSenha2026!");

    expect(
      await screen.findByText("Senha alterada. As outras sessões foram encerradas."),
    ).toBeVisible();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("Chrome no Android")).not.toBeInTheDocument());
    expect(chamadas).toContain("PUT /api/me/senha");
  });

  it("leva os erros de validação do backend aos campos e mostra falhas inesperadas", async () => {
    const dialogo = await abrirModal();
    servidor.use(
      http.put("*/api/me/senha", () =>
        HttpResponse.json(
          { codigo: "DADOS_INVALIDOS", campos: { nova_senha: ["nova_senha muito curta"] } },
          { status: 422 },
        ),
      ),
    );

    await preencher(dialogo, SENHA_ATUAL_TESTE, "NovaSenha2026!");
    expect(await within(dialogo).findByText("nova_senha muito curta")).toBeVisible();

    servidor.use(http.put("*/api/me/senha", () => new HttpResponse(null, { status: 500 })));
    await usuario.click(within(dialogo).getByRole("button", { name: "Salvar" }));
    expect(await within(dialogo).findByRole("alert")).toHaveTextContent(
      "Não foi possível concluir a ação. Tente novamente.",
    );
  });

  it("limpa o formulário ao cancelar", async () => {
    const dialogo = await abrirModal();
    await usuario.type(within(dialogo).getByLabelText("Senha atual"), "rascunho");

    await usuario.click(within(dialogo).getByRole("button", { name: "Cancelar" }));
    await usuario.click(screen.getByRole("button", { name: "Trocar senha" }));

    expect(
      within(screen.getByRole("dialog", { name: "Trocar senha" })).getByLabelText("Senha atual"),
    ).toHaveValue("");
  });
});
