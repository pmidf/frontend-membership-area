import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { beforeEach, describe, expect, it } from "vitest";

import { ResultadoFiliacao } from "@/features/auth/components/confirmacao/ResultadoFiliacao";
import { SecaoFiliacao } from "@/features/perfil/components/SecaoFiliacao";
import type { Perfil } from "@/shared/sessao/tipos";
import {
  perfilAguardandoCodigo,
  perfilFiliado,
  perfilNaoFiliado,
  perfilPendente,
  perfilSemVinculo,
} from "@/test/fixtures/pessoas";
import { roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import type { RespostaVinculacao } from "../api/filiacao.api";
import {
  CODIGO_PMI_CORRETO,
  EMAIL_PMI_MASCARADO,
  handlersFiliacao,
  minhaFiliacaoAguardandoCodigo,
  minhaFiliacaoPendente,
  PMI_ID_APROVADO,
  PMI_ID_COM_OUTRO_EMAIL,
  PMI_ID_NAO_LOCALIZADO,
} from "../mocks/filiacao.handlers";
import { PaginaCodigoPmi } from "./PaginaCodigoPmi";
import { PaginaVincularFiliacao } from "./PaginaVincularFiliacao";

let usuario: ReturnType<typeof userEvent.setup>;

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
});

function renderizarSecao(perfil: Perfil) {
  renderizar(<SecaoFiliacao perfil={perfil} />, { sessao: perfil });
  return within(screen.getByRole("region", { name: "Filiação PMI" }));
}

function responderAtualizar(resposta: RespostaVinculacao | { status: number; corpo: object }) {
  servidor.use(
    http.post("*/api/me/filiacao/atualizar", () =>
      "status" in resposta
        ? HttpResponse.json(resposta.corpo, { status: resposta.status })
        : HttpResponse.json(resposta),
    ),
  );
}

async function clicarEmAtualizar(secao: ReturnType<typeof renderizarSecao>) {
  const botao = await secao.findByRole("button", { name: "Atualizar situação" });
  await waitFor(() => expect(botao).toBeEnabled());
  await usuario.click(botao);
}

describe("Ações da seção Filiação PMI", () => {
  it("quem não tem vínculo vai ao formulário do PMI ID", () => {
    const secao = renderizarSecao(perfilSemVinculo);

    expect(secao.getByRole("link", { name: "Informar PMI ID" })).toHaveAttribute(
      "href",
      "/perfil/filiacao/vincular",
    );
    expect(secao.queryByRole("button", { name: /Atualizar situação/ })).not.toBeInTheDocument();
  });

  it("quem aguarda o código volta para a tela do código", () => {
    const secao = renderizarSecao(perfilAguardandoCodigo);

    expect(secao.getByRole("link", { name: "Digitar o código" })).toHaveAttribute(
      "href",
      "/perfil/filiacao/codigo",
    );
  });

  it("pendente atualiza a situação e é aprovado", async () => {
    const secao = renderizarSecao(perfilPendente);
    expect(secao.getByRole("link", { name: "Corrigir PMI ID" })).toHaveAttribute(
      "href",
      "/perfil/filiacao/vincular",
    );

    await clicarEmAtualizar(secao);

    expect(
      await screen.findByText("Filiação confirmada. Seu acesso de filiado está liberado."),
    ).toBeInTheDocument();
  });

  it("filiado em dia atualiza os dados sem a opção de corrigir o PMI ID", async () => {
    const secao = renderizarSecao(perfilFiliado);
    expect(secao.queryByRole("link", { name: "Corrigir PMI ID" })).not.toBeInTheDocument();

    await clicarEmAtualizar(secao);

    expect(
      await screen.findByText("Sua filiação está em dia. Os dados foram atualizados."),
    ).toBeInTheDocument();
  });

  it("explica quando a filiação ainda não foi localizada", async () => {
    responderAtualizar({
      situacao: "PENDENTE",
      resultado: "NAO_LOCALIZADO",
      proxima_atualizacao_em: null,
    });
    const secao = renderizarSecao(perfilPendente);

    await clicarEmAtualizar(secao);

    expect(
      await screen.findByText(
        "Ainda não localizamos sua filiação na base do PMI. Se você se filiou recentemente, a atualização pode levar alguns dias.",
      ),
    ).toBeInTheDocument();
  });

  it("leva à tela do código quando o PMI tem outro e-mail", async () => {
    responderAtualizar({
      situacao: "AGUARDANDO_CODIGO",
      resultado: "CODIGO_ENVIADO",
      email_pmi_mascarado: EMAIL_PMI_MASCARADO,
      proxima_atualizacao_em: null,
    });
    const secao = renderizarSecao(perfilPendente);

    await clicarEmAtualizar(secao);

    await waitFor(() => expect(roteadorFalso.push).toHaveBeenCalledWith("/perfil/filiacao/codigo"));
  });

  it("no limite de consultas, mostra o tempo restante e desabilita o botão", async () => {
    responderAtualizar({
      status: 429,
      corpo: { codigo: "AGUARDE_PARA_ATUALIZAR", segundos_restantes: 90 },
    });
    const secao = renderizarSecao(perfilPendente);

    await clicarEmAtualizar(secao);

    expect(
      await screen.findByText("Você pode consultar o PMI de novo em 1:30."),
    ).toBeInTheDocument();
    expect(
      secao.getByRole("button", { name: /Atualizar situação \(disponível em 1:(30|29)\)/ }),
    ).toBeDisabled();
  });

  it("já começa desabilitado quando a próxima consulta é no futuro", async () => {
    servidor.use(
      ...handlersFiliacao({
        ...minhaFiliacaoPendente,
        proxima_atualizacao_em: new Date(Date.now() + 5 * 60_000).toISOString(),
      }),
    );
    const secao = renderizarSecao(perfilPendente);

    expect(
      await secao.findByRole("button", { name: /Atualizar situação \(disponível em [45]:\d\d\)/ }),
    ).toBeDisabled();
  });

  it("mostra o erro de uma falha inesperada", async () => {
    responderAtualizar({ status: 500, corpo: {} });
    const secao = renderizarSecao(perfilPendente);

    await clicarEmAtualizar(secao);

    expect(
      await screen.findByText("Não foi possível concluir a ação. Tente novamente."),
    ).toBeInTheDocument();
  });
});

describe("Vincular a filiação pelo PMI ID", () => {
  function renderizarPagina(perfil: Perfil = perfilSemVinculo) {
    renderizar(<PaginaVincularFiliacao />, { sessao: perfil });
  }

  async function consultar(pmiId: string) {
    const campo = await screen.findByLabelText("PMI ID");
    await usuario.clear(campo);
    await usuario.type(campo, pmiId);
    await usuario.click(screen.getByRole("button", { name: "Consultar o PMI" }));
  }

  it("aprova na hora e volta para o perfil", async () => {
    renderizarPagina();

    await consultar(PMI_ID_APROVADO);

    await waitFor(() => expect(roteadorFalso.replace).toHaveBeenCalledWith("/perfil#filiacao"));
    expect(
      await screen.findByText("Filiação confirmada. Seu acesso de filiado está liberado."),
    ).toBeInTheDocument();
  });

  it("vai para a tela do código quando o e-mail do PMI é outro", async () => {
    renderizarPagina();

    await consultar(PMI_ID_COM_OUTRO_EMAIL);

    await waitFor(() => expect(roteadorFalso.push).toHaveBeenCalledWith("/perfil/filiacao/codigo"));
  });

  it("explica, sem sair da página, quando o PMI não localiza a filiação", async () => {
    renderizarPagina();

    await consultar(PMI_ID_NAO_LOCALIZADO);

    expect(await screen.findByText(/Ainda não localizamos sua filiação/)).toBeInTheDocument();
    expect(roteadorFalso.push).not.toHaveBeenCalled();
  });

  it("recusa PMI ID com letras antes de consultar", async () => {
    renderizarPagina();

    await consultar("12AB");

    expect(await screen.findByText("Informe seu PMI ID (só números)")).toBeInTheDocument();
  });

  it("mostra o erro de campo devolvido pela API", async () => {
    servidor.use(
      http.post("*/api/me/filiacao/vincular", () =>
        HttpResponse.json(
          { codigo: "DADOS_INVALIDOS", campos: { pmi_id: ["pmi_id deve conter só números"] } },
          { status: 422 },
        ),
      ),
    );
    renderizarPagina();

    await consultar("123");

    expect(await screen.findByText("pmi_id deve conter só números")).toBeInTheDocument();
  });

  it("no limite de consultas, diz quando tentar de novo", async () => {
    servidor.use(
      http.post("*/api/me/filiacao/vincular", () =>
        HttpResponse.json(
          { codigo: "AGUARDE_PARA_ATUALIZAR", segundos_restantes: 600 },
          { status: 429 },
        ),
      ),
    );
    renderizarPagina();

    await consultar("123");

    expect(
      await screen.findByText("Você pode consultar o PMI de novo em 10:00."),
    ).toBeInTheDocument();
  });

  it("mostra a mensagem de um erro sem campo", async () => {
    servidor.use(
      http.post("*/api/me/filiacao/vincular", () =>
        HttpResponse.json({ codigo: "FILIACAO_JA_APROVADA" }, { status: 409 }),
      ),
    );
    renderizarPagina();

    await consultar("123");

    expect(
      await screen.findByText("Sua filiação já está confirmada e o PMI ID não pode mais mudar."),
    ).toBeInTheDocument();
  });

  it("preenche o PMI ID gravado e avisa do código pendente", async () => {
    renderizarPagina(perfilAguardandoCodigo);

    expect(await screen.findByLabelText("PMI ID")).toHaveValue(
      perfilAguardandoCodigo.filiacao!.pmi_id,
    );
    expect(screen.getByText("Você já tem um código pendente.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Digitar o código" })).toHaveAttribute(
      "href",
      "/perfil/filiacao/codigo",
    );
  });

  it("não mostra o formulário para quem já é filiado", async () => {
    renderizarPagina(perfilFiliado);

    expect(await screen.findByText("Sua filiação já está confirmada.")).toBeInTheDocument();
    expect(screen.queryByLabelText("PMI ID")).not.toBeInTheDocument();
  });
});

describe("Confirmar o código enviado ao e-mail do PMI", () => {
  function renderizarPagina() {
    servidor.use(
      http.get("*/api/me/filiacao", () => HttpResponse.json(minhaFiliacaoAguardandoCodigo)),
    );
    renderizar(<PaginaCodigoPmi />, { sessao: perfilAguardandoCodigo });
  }

  async function colarCodigo(codigo: string) {
    const primeira = await screen.findByRole("textbox", { name: "Dígito 1 de 6" });
    await waitFor(() => expect(primeira).toHaveFocus());
    await usuario.paste(codigo);
  }

  it("mostra o e-mail mascarado e confirma o código certo", async () => {
    renderizarPagina();

    expect(await screen.findByText(EMAIL_PMI_MASCARADO)).toBeInTheDocument();
    await colarCodigo(CODIGO_PMI_CORRETO);

    await waitFor(() => expect(roteadorFalso.replace).toHaveBeenCalledWith("/perfil#filiacao"));
    expect(
      await screen.findByText("Filiação confirmada. Seu acesso de filiado está liberado."),
    ).toBeInTheDocument();
  });

  it("código errado mostra o erro no campo e limpa os dígitos", async () => {
    renderizarPagina();

    await colarCodigo("000000");

    expect(
      await screen.findByText("Código incorreto. Confira e tente novamente."),
    ).toBeInTheDocument();
    expect(roteadorFalso.replace).not.toHaveBeenCalled();
  });

  it("mostra um erro geral quando não há mais código pendente", async () => {
    servidor.use(
      http.post("*/api/me/filiacao/codigo/confirmar", () =>
        HttpResponse.json({ codigo: "SEM_CODIGO_PENDENTE" }, { status: 409 }),
      ),
    );
    renderizarPagina();

    await colarCodigo(CODIGO_PMI_CORRETO);

    expect(
      await screen.findByText("Não há código pendente. Informe seu PMI ID de novo."),
    ).toBeInTheDocument();
  });

  it("código expirado destaca o reenvio, que manda outro código", async () => {
    servidor.use(
      http.post("*/api/me/filiacao/codigo/confirmar", () =>
        HttpResponse.json({ codigo: "CODIGO_EXPIRADO" }, { status: 422 }),
      ),
    );
    renderizarPagina();
    await colarCodigo(CODIGO_PMI_CORRETO);
    expect(await screen.findByText(/Este código expirou/)).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Reenviar código" }));

    expect(
      await screen.findByText(`Enviamos um novo código para ${EMAIL_PMI_MASCARADO}.`),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reenviar código \(disponível em/ })).toBeDisabled();
  });

  it("reenvio cedo demais respeita o tempo devolvido pela API", async () => {
    servidor.use(
      http.post("*/api/me/filiacao/codigo/reenviar", () =>
        HttpResponse.json(
          { codigo: "AGUARDE_PARA_REENVIAR", segundos_restantes: 45 },
          {
            status: 429,
          },
        ),
      ),
    );
    renderizarPagina();

    await usuario.click(await screen.findByRole("button", { name: "Reenviar código" }));

    expect(
      await screen.findByRole("button", { name: /Reenviar código \(disponível em 0:4[45]\)/ }),
    ).toBeDisabled();
  });

  it("reenvio com falha inesperada mostra o erro", async () => {
    servidor.use(
      http.post("*/api/me/filiacao/codigo/reenviar", () => HttpResponse.json({}, { status: 500 })),
    );
    renderizarPagina();

    await usuario.click(await screen.findByRole("button", { name: "Reenviar código" }));

    expect(
      await screen.findByText("Não foi possível concluir a ação. Tente novamente."),
    ).toBeInTheDocument();
  });

  it("sem código pendente, orienta a informar o PMI ID", async () => {
    servidor.use(...handlersFiliacao(minhaFiliacaoPendente));
    renderizar(<PaginaCodigoPmi />, { sessao: perfilPendente });

    expect(await screen.findByText("Não há código pendente")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Informar PMI ID" })).toHaveAttribute(
      "href",
      "/perfil/filiacao/vincular",
    );
  });

  it("falha ao carregar permite tentar de novo", async () => {
    servidor.use(http.get("*/api/me/filiacao", () => HttpResponse.json({}, { status: 500 })));
    renderizar(<PaginaCodigoPmi />, { sessao: perfilAguardandoCodigo });

    expect(await screen.findByText("Não foi possível carregar")).toBeInTheDocument();
    servidor.use(...handlersFiliacao(minhaFiliacaoAguardandoCodigo));
    await usuario.click(screen.getByRole("button", { name: /Tentar novamente/ }));

    expect(await screen.findByText(EMAIL_PMI_MASCARADO)).toBeInTheDocument();
  });
});

describe("Resultado do cadastro com código ao e-mail do PMI", () => {
  it("oferece confirmar o código agora ou depois", () => {
    renderizar(<ResultadoFiliacao resultado="CODIGO_ENVIADO" />, { sessao: perfilNaoFiliado });

    expect(screen.getByRole("heading", { name: "Falta um passo" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Confirmar o código" })).toHaveAttribute(
      "href",
      "/perfil/filiacao/codigo",
    );
    expect(screen.getByRole("link", { name: "Confirmar depois" })).toHaveAttribute(
      "href",
      "/inicio",
    );
  });
});
