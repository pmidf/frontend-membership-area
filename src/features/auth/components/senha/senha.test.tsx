import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { definirNavegacao, roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { TOKEN_SENHA_VALIDO } from "../../mocks/auth.handlers";
import { EsqueciSenha } from "./EsqueciSenha";
import { RedefinicaoSenha, RedefinicaoSenhaPelaUrl } from "./RedefinicaoSenha";

let usuario: ReturnType<typeof userEvent.setup>;

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
});

afterEach(() => {
  vi.useRealTimers();
  servidor.events.removeAllListeners();
});

function contar(caminho: string) {
  const chamadas: string[] = [];
  servidor.events.on("request:start", ({ request }) => {
    if (new URL(request.url).pathname === caminho) chamadas.push(request.method);
  });
  return chamadas;
}

describe("EsqueciSenha", () => {
  it("mostra sempre a mesma resposta neutra e segura o reenvio por 60 segundos", async () => {
    const pedidos = contar("/api/auth/senha/esqueci");
    renderizar(<EsqueciSenha />);

    await usuario.type(screen.getByLabelText("E-mail"), "ninguem@teste.pmidf.org.br");
    await usuario.click(screen.getByRole("button", { name: "Enviar instruções" }));

    expect(await screen.findByRole("heading", { name: "Verifique seu e-mail" })).toBeVisible();
    expect(screen.getByText("ninguem@teste.pmidf.org.br").parentElement).toHaveTextContent(
      "Se ninguem@teste.pmidf.org.br estiver cadastrado, você receberá um link para criar uma nova senha. O link vale por 60 minutos.",
    );
    expect(
      screen.getByRole("button", { name: "Enviar de novo (disponível em 1:00)" }),
    ).toBeDisabled();
    expect(screen.getByRole("link", { name: "Voltar para o login" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(pedidos).toEqual(["POST"]);
  });

  it("libera o reenvio depois da contagem e avisa o novo envio", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const pedidos = contar("/api/auth/senha/esqueci");
    renderizar(<EsqueciSenha />);
    await usuario.type(screen.getByLabelText("E-mail"), "maria@teste.pmidf.org.br");
    await usuario.click(screen.getByRole("button", { name: "Enviar instruções" }));
    await screen.findByRole("heading", { name: "Verifique seu e-mail" });

    for (let segundo = 0; segundo < 60; segundo += 1) {
      await act(() => vi.advanceTimersByTimeAsync(1000));
    }
    await usuario.click(screen.getByRole("button", { name: "Enviar de novo" }));

    expect(await screen.findByText("Enviamos as instruções de novo.")).toBeVisible();
    expect(screen.getByRole("button", { name: /disponível em 1:00/ })).toBeDisabled();
    expect(pedidos).toEqual(["POST", "POST"]);
  });

  it("valida o e-mail antes de enviar e oferece voltar ao login", async () => {
    const pedidos = contar("/api/auth/senha/esqueci");
    renderizar(<EsqueciSenha />);

    await usuario.click(screen.getByRole("button", { name: "Enviar instruções" }));

    expect(await screen.findByText("Informe seu e-mail")).toBeVisible();
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/login");
    expect(pedidos).toEqual([]);
  });

  it("avisa falhas de rede sem revelar nada sobre a conta", async () => {
    servidor.use(http.post("*/api/auth/senha/esqueci", () => HttpResponse.error()));
    renderizar(<EsqueciSenha />);

    await usuario.type(screen.getByLabelText("E-mail"), "maria@teste.pmidf.org.br");
    await usuario.click(screen.getByRole("button", { name: "Enviar instruções" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível conectar ao servidor. Verifique sua conexão.",
    );
    expect(screen.queryByRole("heading", { name: "Verifique seu e-mail" })).not.toBeInTheDocument();
  });

  it("avisa quando o reenvio falha", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderizar(<EsqueciSenha />);
    await usuario.type(screen.getByLabelText("E-mail"), "maria@teste.pmidf.org.br");
    await usuario.click(screen.getByRole("button", { name: "Enviar instruções" }));
    await screen.findByRole("heading", { name: "Verifique seu e-mail" });
    servidor.use(
      http.post("*/api/auth/senha/esqueci", () => new HttpResponse(null, { status: 500 })),
    );

    for (let segundo = 0; segundo < 60; segundo += 1) {
      await act(() => vi.advanceTimersByTimeAsync(1000));
    }
    await usuario.click(screen.getByRole("button", { name: "Enviar de novo" }));

    const avisos = screen.getByRole("region", { name: "Avisos" });
    expect(
      await within(avisos).findByText("Não foi possível concluir a ação. Tente novamente."),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "Enviar de novo" })).toBeEnabled();
  });
});

describe("RedefinicaoSenha", () => {
  async function preencher(novaSenha: string, confirmacao = novaSenha) {
    await usuario.type(await screen.findByLabelText("Nova senha"), novaSenha);
    await usuario.type(screen.getByLabelText("Confirmar nova senha"), confirmacao);
    await usuario.click(screen.getByRole("button", { name: "Salvar nova senha" }));
  }

  it("valida o link e mostra o formulário com a força da senha e o aviso de sessões", async () => {
    renderizar(<RedefinicaoSenha token={TOKEN_SENHA_VALIDO} />);

    expect(screen.getByRole("status")).toHaveTextContent("Validando o link…");
    expect(await screen.findByRole("heading", { name: "Crie uma nova senha" })).toBeVisible();
    expect(screen.getByText("Ao salvar, todas as suas sessões serão encerradas")).toBeVisible();

    await usuario.type(screen.getByLabelText("Nova senha"), "SenhaForte2026!");
    expect(screen.getByText("Força da senha: forte")).toBeVisible();
  });

  it.each([
    ["expirado ou usado", "token-usado"],
    ["ausente", ""],
  ])("mostra o link inválido quando o token está %s", async (_, token) => {
    renderizar(<RedefinicaoSenha token={token} />);

    expect(await screen.findByRole("heading", { name: "Este link não vale mais" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Pedir novo link" })).toHaveAttribute(
      "href",
      "/esqueci-senha",
    );
  });

  it("trata o 422 da validação como link inválido", async () => {
    servidor.use(
      http.get("*/api/auth/senha/redefinir/validar", () =>
        HttpResponse.json(
          { codigo: "DADOS_INVALIDOS", campos: { token: ["inválido"] } },
          { status: 422 },
        ),
      ),
    );
    renderizar(<RedefinicaoSenha token={"x".repeat(200)} />);

    expect(await screen.findByRole("heading", { name: "Este link não vale mais" })).toBeVisible();
  });

  it("não envia com senhas diferentes ou curtas", async () => {
    const envios = contar("/api/auth/senha/redefinir");
    renderizar(<RedefinicaoSenha token={TOKEN_SENHA_VALIDO} />);

    await preencher("SenhaForte2026!", "SenhaForte2025!");
    expect(await screen.findByText("As senhas não conferem")).toBeVisible();

    await usuario.clear(screen.getByLabelText("Nova senha"));
    await usuario.type(screen.getByLabelText("Nova senha"), "curta");
    await usuario.click(screen.getByRole("button", { name: "Salvar nova senha" }));
    expect(await screen.findByText("Use pelo menos 10 caracteres")).toBeVisible();
    expect(envios).toEqual([]);
  });

  it("salva a nova senha e volta ao login com aviso", async () => {
    renderizar(<RedefinicaoSenha token={TOKEN_SENHA_VALIDO} />);

    await preencher("SenhaForte2026!");

    await waitFor(() => expect(roteadorFalso.replace).toHaveBeenCalledWith("/login"));
    expect(await screen.findByText("Senha alterada. Entre com a nova senha.")).toBeVisible();
  });

  it("mostra o link inválido quando o token expira antes de salvar", async () => {
    renderizar(<RedefinicaoSenha token={TOKEN_SENHA_VALIDO} />);
    servidor.use(
      http.post("*/api/auth/senha/redefinir", () =>
        HttpResponse.json({ codigo: "TOKEN_INVALIDO" }, { status: 422 }),
      ),
    );

    await preencher("SenhaForte2026!");

    expect(await screen.findByRole("heading", { name: "Este link não vale mais" })).toBeVisible();
    expect(roteadorFalso.replace).not.toHaveBeenCalled();
  });

  it("leva o erro de validação do backend ao campo de nova senha", async () => {
    renderizar(<RedefinicaoSenha token={TOKEN_SENHA_VALIDO} />);
    servidor.use(
      http.post("*/api/auth/senha/redefinir", () =>
        HttpResponse.json(
          { codigo: "DADOS_INVALIDOS", campos: { nova_senha: ["nova_senha muito longa"] } },
          { status: 422 },
        ),
      ),
    );

    await preencher("SenhaForte2026!");

    expect(await screen.findByText("nova_senha muito longa")).toBeVisible();
    expect(screen.getByLabelText("Nova senha")).toHaveAttribute("aria-invalid", "true");
  });

  it("avisa falhas inesperadas ao salvar", async () => {
    renderizar(<RedefinicaoSenha token={TOKEN_SENHA_VALIDO} />);
    servidor.use(
      http.post("*/api/auth/senha/redefinir", () => new HttpResponse(null, { status: 500 })),
    );

    await preencher("SenhaForte2026!");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível concluir a ação. Tente novamente.",
    );
  });

  it("lê o token da URL, mesmo com o ponto final que veio do e-mail", async () => {
    definirNavegacao("/redefinir-senha", `token=${TOKEN_SENHA_VALIDO}.`);
    renderizar(<RedefinicaoSenhaPelaUrl />);

    expect(await screen.findByRole("heading", { name: "Crie uma nova senha" })).toBeVisible();
  });
});
