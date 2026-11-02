import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { describe, expect, it, vi } from "vitest";

import { api } from "@/shared/api/cliente-http";
import { obterToken } from "@/shared/api/token-sessao";
import { perfilAdmin, perfilFiliado, perfilNaoFiliado } from "@/test/fixtures/pessoas";
import { roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { ExigeAdmin } from "./ExigeAdmin";
import { ExigeLogin } from "./ExigeLogin";
import { SomenteFiliado } from "./SomenteFiliado";
import { useSessao } from "./useSessao";

function Painel() {
  const { estado, perfil, ehFiliado, ehAdmin, entrar, sair } = useSessao();
  return (
    <div>
      <p data-testid="estado">{estado}</p>
      <p data-testid="nome">{perfil?.nome_completo ?? "—"}</p>
      <p data-testid="papeis">{`${ehFiliado ? "filiado" : "nao-filiado"} ${ehAdmin ? "admin" : ""}`}</p>
      <button onClick={() => entrar({ access_token: "token-de-teste", expira_em_segundos: 900 })}>
        Entrar
      </button>
      <button onClick={() => sair()}>Sair</button>
      <button onClick={() => api.obter("/protegido").catch(() => undefined)}>Chamar</button>
    </div>
  );
}

describe("ProvedorSessao", () => {
  it("fica anônimo quando não há cookie de sessão", async () => {
    renderizar(<Painel />);

    expect(screen.getByTestId("estado")).toHaveTextContent("carregando");
    await waitFor(() => expect(screen.getByTestId("estado")).toHaveTextContent("anonimo"));
    expect(screen.getByTestId("nome")).toHaveTextContent("—");
  });

  it("restaura a sessão pelo refresh e carrega o perfil com os papéis", async () => {
    renderizar(<Painel />, { sessao: perfilFiliado });

    await waitFor(() => expect(screen.getByTestId("estado")).toHaveTextContent("autenticado"));
    expect(screen.getByTestId("nome")).toHaveTextContent("Maria Souza");
    expect(screen.getByTestId("papeis")).toHaveTextContent("filiado");
  });

  it("entra com uma sessão emitida e sai encerrando no backend", async () => {
    const encerramentos = vi.fn();
    renderizar(<Painel />);
    await waitFor(() => expect(screen.getByTestId("estado")).toHaveTextContent("anonimo"));
    servidor.use(
      http.get("*/api/me", () => HttpResponse.json(perfilAdmin)),
      http.post("*/api/auth/logout", () => {
        encerramentos();
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    await waitFor(() => expect(screen.getByTestId("papeis")).toHaveTextContent("admin"));
    expect(obterToken()).toBe("token-de-teste");

    await userEvent.click(screen.getByRole("button", { name: "Sair" }));
    await waitFor(() => expect(screen.getByTestId("estado")).toHaveTextContent("anonimo"));
    expect(encerramentos).toHaveBeenCalledOnce();
    expect(obterToken()).toBeNull();
  });

  it("volta a anônimo quando a sessão expira numa requisição", async () => {
    renderizar(<Painel />, { sessao: perfilFiliado });
    await waitFor(() => expect(screen.getByTestId("estado")).toHaveTextContent("autenticado"));
    servidor.use(
      http.get("*/api/protegido", () => new HttpResponse(null, { status: 401 })),
      http.post("*/api/auth/refresh", () => new HttpResponse(null, { status: 401 })),
    );

    await userEvent.click(screen.getByRole("button", { name: "Chamar" }));

    await waitFor(() => expect(screen.getByTestId("estado")).toHaveTextContent("anonimo"));
  });
});

describe("guardas", () => {
  it("ExigeLogin redireciona o anônimo para o login com o destino", async () => {
    window.history.pushState({}, "", "/perfil?aba=seguranca");
    renderizar(
      <ExigeLogin>
        <p>Área protegida</p>
      </ExigeLogin>,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Carregando sua sessão");
    await waitFor(() =>
      expect(roteadorFalso.replace).toHaveBeenCalledWith(
        "/login?redirecionar=%2Fperfil%3Faba%3Dseguranca",
      ),
    );
    expect(screen.queryByText("Área protegida")).not.toBeInTheDocument();
    window.history.pushState({}, "", "/");
  });

  it("ExigeLogin mostra o conteúdo para quem está autenticado", async () => {
    renderizar(
      <ExigeLogin>
        <p>Área protegida</p>
      </ExigeLogin>,
      { sessao: perfilNaoFiliado },
    );

    expect(await screen.findByText("Área protegida")).toBeInTheDocument();
    expect(roteadorFalso.replace).not.toHaveBeenCalled();
  });

  it("ExigeAdmin bloqueia quem não é Admin sem montar o console", async () => {
    const montado = vi.fn();
    function Console() {
      montado();
      return <p>Console</p>;
    }
    renderizar(
      <ExigeAdmin>
        <Console />
      </ExigeAdmin>,
      { sessao: perfilFiliado },
    );

    expect(await screen.findByText("Acesso restrito")).toBeInTheDocument();
    expect(montado).not.toHaveBeenCalled();
  });

  it("ExigeAdmin libera o Admin", async () => {
    renderizar(
      <ExigeAdmin>
        <p>Console</p>
      </ExigeAdmin>,
      { sessao: perfilAdmin },
    );

    expect(await screen.findByText("Console")).toBeInTheDocument();
  });

  it("SomenteFiliado mostra a alternativa para quem não é Filiado", async () => {
    renderizar(
      <SomenteFiliado alternativa={<p>Prévia bloqueada</p>}>
        <p>Conteúdo exclusivo</p>
      </SomenteFiliado>,
      { sessao: perfilNaoFiliado },
    );

    await waitFor(() => expect(screen.getByText("Prévia bloqueada")).toBeInTheDocument());
    expect(screen.queryByText("Conteúdo exclusivo")).not.toBeInTheDocument();
  });

  it("SomenteFiliado mostra o conteúdo para o Filiado", async () => {
    renderizar(
      <SomenteFiliado alternativa={<p>Prévia bloqueada</p>}>
        <p>Conteúdo exclusivo</p>
      </SomenteFiliado>,
      { sessao: perfilFiliado },
    );

    expect(await screen.findByText("Conteúdo exclusivo")).toBeInTheDocument();
  });

  it("useSessao exige o provedor", async () => {
    const { render } = await import("@testing-library/react");
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Painel />)).toThrow("useSessao precisa estar dentro de ProvedorSessao");
  });
});
