import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { perfilFiliado, perfilNaoFiliado } from "@/test/fixtures/pessoas";
import { TOKEN_TESTE } from "@/test/handlers-sessao";
import { definirNavegacao, roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import type { ResultadoVinculacao } from "../../api/auth.api";
import { CODIGO_TESTE } from "../../mocks/auth.handlers";
import { ConfirmacaoEmail, ConfirmacaoEmailPelaUrl } from "./ConfirmacaoEmail";

const EMAIL = "maria@teste.pmidf.org.br";

let usuario: ReturnType<typeof userEvent.setup>;

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
});

afterEach(() => vi.useRealTimers());

function responderConfirmacao(resultado: ResultadoVinculacao | null) {
  servidor.use(
    http.post("*/api/auth/confirmar-email", () =>
      HttpResponse.json({
        access_token: TOKEN_TESTE,
        expira_em_segundos: 900,
        filiacao: { situacao: resultado === "APROVADO" ? "APROVADO" : "SEM_VINCULO", resultado },
      }),
    ),
    http.get("*/api/me", () =>
      HttpResponse.json(resultado === "APROVADO" ? perfilFiliado : perfilNaoFiliado),
    ),
  );
}

async function colarCodigo(codigo = CODIGO_TESTE) {
  const primeira = await screen.findByRole("textbox", { name: "Dígito 1 de 6" });
  await waitFor(() => expect(primeira).toHaveFocus());
  await usuario.paste(codigo);
}

async function avancarSegundos(segundos: number) {
  for (let segundo = 0; segundo < segundos; segundo += 1) {
    await act(() => vi.advanceTimersByTimeAsync(1000));
  }
}

function renderizarTela(origem: "login" | null = null, email = EMAIL) {
  return renderizar(<ConfirmacaoEmail emailInicial={email} origem={origem} />);
}

describe("ConfirmacaoEmail", () => {
  it("chega do cadastro com o e-mail no texto, foco no código e reenvio em 2:00", async () => {
    renderizarTela();

    expect(await screen.findByRole("heading", { name: "Confirme seu e-mail" })).toBeVisible();
    expect(screen.getByText(EMAIL)).toBeVisible();
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "Dígito 1 de 6" })).toHaveFocus(),
    );
    expect(
      screen.getByRole("button", { name: "Reenviar código (disponível em 2:00)" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeDisabled();
    expect(screen.getByRole("link", { name: "Corrigir e-mail" })).toHaveAttribute(
      "href",
      "/cadastro",
    );
    expect(screen.queryByText("Confirme seu e-mail para entrar.")).not.toBeInTheDocument();
  });

  it("vindo do login, avisa e libera o reenvio na hora", async () => {
    renderizarTela("login");

    expect(await screen.findByText("Confirme seu e-mail para entrar.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Reenviar código" })).toBeEnabled();
  });

  it("confirma ao colar e, sem PMI ID, entra direto no início com boas-vindas", async () => {
    renderizarTela();
    responderConfirmacao(null);

    await colarCodigo();

    await waitFor(() => expect(roteadorFalso.replace).toHaveBeenCalledWith("/inicio"));
    expect(await screen.findByText("E-mail confirmado. Boas-vindas ao PMI-DF!")).toBeVisible();
  });

  it("mostra a filiação confirmada com saudação pelo primeiro nome", async () => {
    renderizarTela();
    responderConfirmacao("APROVADO");

    await colarCodigo();

    expect(await screen.findByRole("heading", { name: "Filiação confirmada" })).toBeVisible();
    expect(screen.getByText("Filiado")).toBeVisible();
    expect(await screen.findByText("Bem-vinda, Maria!")).toBeVisible();
    expect(
      screen.getByText(
        "Nome e PMI ID passam a vir da base do PMI e ficam somente leitura no seu perfil.",
      ),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Entrar na plataforma" })).toHaveAttribute(
      "href",
      "/inicio",
    );
    expect(roteadorFalso.replace).not.toHaveBeenCalled();
  });

  it.each<[ResultadoVinculacao, string]>([
    ["NAO_LOCALIZADO", "Não localizamos sua filiação na base do PMI."],
    ["PMI_INDISPONIVEL", "Não conseguimos consultar o PMI agora."],
    [
      "OUTRO_CAPITULO",
      "Sua filiação ao PMI foi localizada, mas você não é filiado ao capítulo PMI-DF.",
    ],
    ["FILIACAO_INATIVA", "Sua filiação ao PMI-DF está inativa."],
    ["DADOS_NAO_CONFEREM", "Os dados informados não conferem com o cadastro do PMI."],
  ])("explica o resultado %s sem sair da tela", async (resultado, mensagem) => {
    renderizarTela();
    responderConfirmacao(resultado);

    await colarCodigo();

    expect(await screen.findByRole("heading", { name: "Conta criada" })).toBeVisible();
    expect(screen.getByText("Não filiado")).toBeVisible();
    expect(screen.getByText(mensagem)).toBeVisible();
    expect(screen.getByRole("link", { name: "Meu perfil" })).toHaveAttribute(
      "href",
      "/perfil#filiacao",
    );
    expect(roteadorFalso.replace).not.toHaveBeenCalled();
  });

  it("oferece o caminho de filiação quando a pessoa é de outro capítulo", async () => {
    renderizarTela();
    responderConfirmacao("OUTRO_CAPITULO");

    await colarCodigo();

    expect(await screen.findByRole("link", { name: /Saiba como se filiar/ })).toHaveAttribute(
      "target",
      "_blank",
    );
  });

  it("limpa as caixas e volta o foco à primeira quando o código está errado", async () => {
    renderizarTela();

    await colarCodigo("654321");

    expect(await screen.findByText("Código incorreto. Confira e tente novamente.")).toBeVisible();
    const primeira = screen.getByRole("textbox", { name: "Dígito 1 de 6" });
    expect(primeira).toHaveValue("");
    await waitFor(() => expect(primeira).toHaveFocus());
  });

  it("destaca o reenvio quando o código expirou", async () => {
    servidor.use(
      http.post("*/api/auth/confirmar-email", () =>
        HttpResponse.json({ codigo: "CODIGO_EXPIRADO" }, { status: 422 }),
      ),
    );
    renderizarTela("login");

    await colarCodigo();

    expect(
      await screen.findByText("Este código expirou ou foi invalidado. Peça um novo código."),
    ).toBeVisible();
    await usuario.click(screen.getByRole("button", { name: "Reenviar código" }));
    expect(await screen.findByText(`Enviamos um novo código para ${EMAIL}.`)).toBeVisible();
    expect(screen.queryByText(/Este código expirou/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /disponível em 2:00/ })).toBeDisabled();
  });

  it("reinicia a contagem com os segundos do backend quando o reenvio é cedo demais", async () => {
    servidor.use(
      http.post("*/api/auth/confirmar-email/reenviar", () =>
        HttpResponse.json(
          { codigo: "AGUARDE_PARA_REENVIAR", segundos_restantes: 87 },
          { status: 429 },
        ),
      ),
    );
    renderizarTela("login");

    await usuario.click(await screen.findByRole("button", { name: "Reenviar código" }));

    expect(
      await screen.findByRole("button", { name: "Reenviar código (disponível em 1:27)" }),
    ).toBeDisabled();
  });

  it("conta o tempo até liberar o reenvio", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderizarTela();
    await screen.findByRole("button", { name: /disponível em 2:00/ });

    await avancarSegundos(18);
    expect(screen.getByRole("button", { name: /disponível em 1:42/ })).toBeDisabled();

    await avancarSegundos(102);
    expect(screen.getByRole("button", { name: "Reenviar código" })).toBeEnabled();
  });

  it("avisa falhas inesperadas sem perder a tela", async () => {
    servidor.use(
      http.post("*/api/auth/confirmar-email", () => new HttpResponse(null, { status: 500 })),
      http.post(
        "*/api/auth/confirmar-email/reenviar",
        () => new HttpResponse(null, { status: 500 }),
      ),
    );
    renderizarTela("login");

    await colarCodigo();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível concluir a ação. Tente novamente.",
    );

    await usuario.click(screen.getByRole("button", { name: "Reenviar código" }));
    const avisos = screen.getByRole("region", { name: "Avisos" });
    expect(
      await within(avisos).findByText("Não foi possível concluir a ação. Tente novamente."),
    ).toBeVisible();
  });

  it("pede o e-mail antes do código quando a URL não traz o e-mail", async () => {
    renderizarTela(null, "");

    await usuario.click(await screen.findByRole("button", { name: "Continuar" }));
    expect(await screen.findByText("Informe seu e-mail")).toBeVisible();

    await usuario.type(screen.getByLabelText("E-mail"), EMAIL);
    await usuario.click(screen.getByRole("button", { name: "Continuar" }));

    expect(await screen.findByText(EMAIL)).toBeVisible();
    expect(screen.getByRole("button", { name: "Reenviar código" })).toBeEnabled();
  });

  it("leva ao início quem já está logado", async () => {
    renderizar(<ConfirmacaoEmail emailInicial={EMAIL} origem={null} />, {
      sessao: perfilNaoFiliado,
    });

    await waitFor(() => expect(roteadorFalso.replace).toHaveBeenCalledWith("/inicio"));
  });

  it("lê o e-mail e a origem da URL", async () => {
    definirNavegacao("/confirmar-email", `email=${encodeURIComponent(EMAIL)}&origem=login`);
    renderizar(<ConfirmacaoEmailPelaUrl />);

    expect(await screen.findByText(EMAIL)).toBeVisible();
    expect(screen.getByText("Confirme seu e-mail para entrar.")).toBeVisible();
  });
});
