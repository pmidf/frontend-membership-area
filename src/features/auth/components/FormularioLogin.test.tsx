import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, describe, expect, it } from "vitest";

import { perfilFiliado } from "@/test/fixtures/pessoas";
import { roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { SENHA_TESTE } from "../mocks/auth.handlers";
import { FormularioLogin } from "./FormularioLogin";

function contarLogins() {
  const chamadas: unknown[] = [];
  servidor.events.on("request:start", ({ request }) => {
    if (request.url.endsWith("/api/auth/login")) chamadas.push(request.url);
  });
  return chamadas;
}

async function preencher(email: string, senha: string) {
  await userEvent.type(screen.getByLabelText("E-mail"), email);
  await userEvent.type(screen.getByLabelText("Senha"), senha);
}

const botaoEntrar = () => screen.getByRole("button", { name: "Entrar" });

afterEach(() => {
  servidor.events.removeAllListeners();
  window.history.pushState({}, "", "/");
});

describe("FormularioLogin", () => {
  it("entra, abre a sessão e segue para o destino seguro", async () => {
    window.history.pushState({}, "", "/login?redirecionar=%2Fvagas");
    renderizar(<FormularioLogin />);
    servidor.use(http.get("*/api/me", () => HttpResponse.json(perfilFiliado)));

    await preencher("maria.souza@teste.pmidf.org.br", SENHA_TESTE);
    await userEvent.click(botaoEntrar());

    await waitFor(() => expect(roteadorFalso.replace).toHaveBeenCalledWith("/vagas"));
  });

  it("ignora um redirecionar externo e vai para o início", async () => {
    window.history.pushState({}, "", "/login?redirecionar=https%3A%2F%2Fsite-externo.com");
    renderizar(<FormularioLogin />);
    servidor.use(http.get("*/api/me", () => HttpResponse.json(perfilFiliado)));

    await preencher("maria.souza@teste.pmidf.org.br", SENHA_TESTE);
    await userEvent.click(botaoEntrar());

    await waitFor(() => expect(roteadorFalso.replace).toHaveBeenCalledWith("/inicio"));
  });

  it("mostra o erro genérico de credenciais, mantém o e-mail e limpa a senha", async () => {
    renderizar(<FormularioLogin />);

    await preencher("maria.souza@teste.pmidf.org.br", "senha-errada");
    await userEvent.click(botaoEntrar());

    const alerta = await screen.findByRole("alert");
    expect(alerta).toHaveTextContent("E-mail ou senha inválidos.");
    expect(screen.queryByRole("button", { name: "Tentar novamente" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toHaveValue("maria.souza@teste.pmidf.org.br");
    expect(screen.getByLabelText("Senha")).toHaveValue("");
  });

  it("leva o e-mail não confirmado à tela de confirmação, indicando a origem", async () => {
    renderizar(<FormularioLogin />);

    await preencher("pendente@teste.pmidf.org.br", SENHA_TESTE);
    await userEvent.click(botaoEntrar());

    await waitFor(() =>
      expect(roteadorFalso.push).toHaveBeenCalledWith(
        "/confirmar-email?email=pendente%40teste.pmidf.org.br&origem=login",
      ),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("avisa a conta suspensa", async () => {
    renderizar(<FormularioLogin />);

    await preencher("suspensa@teste.pmidf.org.br", SENHA_TESTE);
    await userEvent.click(botaoEntrar());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Sua conta está suspensa. Fale com a diretoria do PMI-DF para mais informações.",
    );
  });

  it("valida localmente sem chamar o backend", async () => {
    const chamadas = contarLogins();
    renderizar(<FormularioLogin />);

    await userEvent.click(botaoEntrar());
    expect(await screen.findByText("Informe seu e-mail")).toBeInTheDocument();
    expect(screen.getByText("Informe sua senha")).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText("E-mail"), "maria@");
    await userEvent.click(botaoEntrar());
    expect(await screen.findByText("Informe um e-mail válido")).toBeInTheDocument();
    expect(chamadas).toHaveLength(0);
  });

  it("leva os erros de validação do backend aos campos", async () => {
    servidor.use(
      http.post("*/api/auth/login", () =>
        HttpResponse.json(
          { codigo: "DADOS_INVALIDOS", campos: { email: ["email must be an email"] } },
          { status: 422 },
        ),
      ),
    );
    renderizar(<FormularioLogin />);

    await preencher("maria@teste.pmidf.org.br", SENHA_TESTE);
    await userEvent.click(botaoEntrar());

    expect(await screen.findByText("email must be an email")).toBeInTheDocument();
    expect(screen.getByLabelText("E-mail")).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("oferece nova tentativa quando o servidor falha", async () => {
    let tentativas = 0;
    servidor.use(
      http.post("*/api/auth/login", () => {
        tentativas += 1;
        return new HttpResponse(null, { status: 503 });
      }),
    );
    renderizar(<FormularioLogin />);

    await preencher("maria@teste.pmidf.org.br", SENHA_TESTE);
    await userEvent.click(botaoEntrar());
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível concluir a ação. Tente novamente.",
    );

    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    await waitFor(() => expect(tentativas).toBe(2));
  });

  it("não envia uma segunda requisição enquanto a primeira está em andamento", async () => {
    let liberar: () => void = () => undefined;
    const chamadas = contarLogins();
    servidor.use(
      http.post("*/api/auth/login", async () => {
        await new Promise<void>((resolver) => {
          liberar = resolver;
        });
        return HttpResponse.json({ codigo: "CREDENCIAIS_INVALIDAS" }, { status: 401 });
      }),
    );
    renderizar(<FormularioLogin />);

    await preencher("maria@teste.pmidf.org.br", SENHA_TESTE);
    await userEvent.click(botaoEntrar());
    await waitFor(() => expect(botaoEntrar()).toHaveAttribute("aria-busy", "true"));
    await userEvent.click(botaoEntrar());
    liberar();

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(chamadas).toHaveLength(1);
  });

  it("oferece os caminhos de recuperação e cadastro", () => {
    renderizar(<FormularioLogin />);

    expect(screen.getByRole("heading", { name: "Bem-vindo de volta", level: 1 })).toBeVisible();
    expect(screen.getByRole("link", { name: "Esqueci minha senha" })).toHaveAttribute(
      "href",
      "/esqueci-senha",
    );
    expect(screen.getByRole("link", { name: "Cadastre-se gratuitamente" })).toHaveAttribute(
      "href",
      "/cadastro",
    );
  });
});
