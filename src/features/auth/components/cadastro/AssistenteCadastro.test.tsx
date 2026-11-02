import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { NOME_PMI_FILIADO, PMI_ID_FILIADO } from "../../mocks/auth.handlers";
import { AssistenteCadastro } from "./AssistenteCadastro";

type Requisicoes = { preCadastro: unknown[]; cadastro: unknown[] };

function espionar(): Requisicoes {
  const requisicoes: Requisicoes = { preCadastro: [], cadastro: [] };
  servidor.events.on("request:start", async ({ request }) => {
    if (request.url.endsWith("/api/auth/pre-cadastro")) {
      requisicoes.preCadastro.push(await request.clone().json());
    }
    if (request.url.endsWith("/api/auth/cadastro")) {
      requisicoes.cadastro.push(await request.clone().json());
    }
  });
  return requisicoes;
}

async function digitar(campo: HTMLElement, texto: string) {
  await usuario.click(campo);
  await usuario.paste(texto);
}

const continuar = () => usuario.click(screen.getByRole("button", { name: "Continuar" }));
const titulo = (texto: string) => screen.findByRole("heading", { name: texto, level: 1 });

async function preencherAcesso({
  filiado = false,
  pmiId = "",
  email = "maria@teste.pmidf.org.br",
} = {}) {
  await digitar(screen.getByLabelText("Nome completo"), "Maria Souza");
  await usuario.click(screen.getByRole("radio", { name: filiado ? "Sim" : "Não" }));
  if (pmiId) await digitar(screen.getByLabelText("PMI ID"), pmiId);
  await digitar(screen.getByLabelText(/^E-mail/), email);
  await digitar(screen.getByLabelText("Senha"), "SenhaForte2026!");
  await usuario.click(screen.getByRole("checkbox", { name: /Li e aceito/ }));
}

async function preencherPessoal(nascimento = "1990-05-12") {
  await digitar(screen.getByLabelText("Telefone"), "61991234567");
  fireEvent.change(screen.getByLabelText("Data de nascimento"), { target: { value: nascimento } });
  await usuario.selectOptions(screen.getByLabelText("Gênero"), "FEMININO");
  await usuario.selectOptions(screen.getByLabelText("Escolaridade"), "MESTRADO");
}

async function preencherEndereco() {
  await digitar(screen.getByLabelText("CEP"), "70040010");
  await usuario.tab();
  await waitFor(() => expect(screen.getByLabelText("Logradouro")).toHaveValue("SBS Quadra 2"));
  await digitar(screen.getByLabelText("Número"), "10");
}

async function preencherProfissional() {
  await digitar(screen.getByLabelText("Empresa onde trabalha"), "Construtora Vega");
  await digitar(screen.getByLabelText("Cargo"), "Gerente de Projetos");
}

async function chegarAoUltimoPasso() {
  await preencherAcesso();
  await continuar();
  await titulo("Sobre você");
  await preencherPessoal();
  await continuar();
  await titulo("Onde você mora");
  await preencherEndereco();
  await continuar();
  await titulo("Sua atuação");
  await preencherProfissional();
}

let usuario: ReturnType<typeof userEvent.setup>;

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
});

afterEach(() => servidor.events.removeAllListeners());

describe("AssistenteCadastro", { timeout: 15_000 }, () => {
  it("percorre os 4 passos com Não e envia os dados sem máscara", async () => {
    const requisicoes = espionar();
    renderizar(<AssistenteCadastro />);

    expect(screen.getByText("Passo 1 de 4 · Dados de acesso")).toBeInTheDocument();
    expect(screen.queryByLabelText("PMI ID")).not.toBeInTheDocument();
    await chegarAoUltimoPasso();
    await usuario.click(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() =>
      expect(roteadorFalso.push).toHaveBeenCalledWith(
        "/confirmar-email?email=maria%40teste.pmidf.org.br",
      ),
    );
    expect(requisicoes.preCadastro).toEqual([]);
    expect(requisicoes.cadastro).toEqual([
      {
        nome_completo: "Maria Souza",
        email: "maria@teste.pmidf.org.br",
        senha: "SenhaForte2026!",
        aceite_termos: true,
        telefone: "61991234567",
        data_nascimento: "1990-05-12",
        genero: "FEMININO",
        escolaridade: "MESTRADO",
        cep: "70040010",
        logradouro: "SBS Quadra 2",
        numero: "10",
        bairro: "Asa Sul",
        cidade: "Brasília",
        uf: "DF",
        empresa: "Construtora Vega",
        cargo: "Gerente de Projetos",
      },
    ]);
  });

  it("valida o passo 1 antes de avançar, exigindo a resposta sobre a filiação", async () => {
    renderizar(<AssistenteCadastro />);

    await continuar();

    expect(await screen.findByText("Informe seu nome completo")).toBeInTheDocument();
    expect(screen.getByText("Responda se você já é filiado ao PMI")).toBeInTheDocument();
    expect(
      screen.getByText("É preciso aceitar os Termos de Uso e a Política de Privacidade"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Nome completo")).toHaveFocus();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Criar sua conta");
  });

  it("com Sim, pede o PMI ID e preenche o nome do PMI quando a filiação é encontrada", async () => {
    const requisicoes = espionar();
    renderizar(<AssistenteCadastro />);

    await preencherAcesso({ filiado: true });
    expect(screen.getByText("Cadastre-se com o mesmo e-mail que você usa no PMI")).toBeVisible();
    expect(screen.getByText("Use o mesmo e-mail cadastrado no MyPMI.")).toBeVisible();
    await continuar();
    expect(await screen.findByText("Informe seu PMI ID (só números)")).toBeInTheDocument();

    await usuario.type(screen.getByLabelText("PMI ID"), PMI_ID_FILIADO);
    await continuar();

    expect(await titulo("Sobre você")).toHaveFocus();
    expect(screen.getByText("Encontramos sua filiação no PMI-DF.")).toBeVisible();
    expect(requisicoes.preCadastro).toEqual([
      { email: "maria@teste.pmidf.org.br", pmi_id: PMI_ID_FILIADO },
    ]);

    await usuario.click(screen.getByRole("button", { name: "Voltar" }));
    expect(await screen.findByLabelText("Nome completo")).toHaveValue(NOME_PMI_FILIADO);
  });

  it("segue sem aviso quando o PMI ID não confere ou a consulta falha", async () => {
    renderizar(<AssistenteCadastro />);

    await preencherAcesso({ filiado: true, pmiId: "1000003" });
    await continuar();
    await titulo("Sobre você");
    expect(screen.queryByText("Encontramos sua filiação no PMI-DF.")).not.toBeInTheDocument();

    servidor.use(
      http.post("*/api/auth/pre-cadastro", () => new HttpResponse(null, { status: 503 })),
    );
    await usuario.click(screen.getByRole("button", { name: "Voltar" }));
    await titulo("Criar sua conta");
    await continuar();
    await titulo("Sobre você");
    expect(screen.queryByText("Encontramos sua filiação no PMI-DF.")).not.toBeInTheDocument();
  });

  it("não deixa avançar com menos de 18 anos e preserva os valores ao voltar", async () => {
    renderizar(<AssistenteCadastro />);
    await preencherAcesso();
    await continuar();
    await titulo("Sobre você");

    await preencherPessoal(`${new Date().getUTCFullYear() - 10}-01-01`);
    await continuar();
    expect(
      await screen.findByText("É preciso ter 18 anos ou mais para criar conta"),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Sobre você");
    expect(screen.getByLabelText("Telefone")).toHaveValue("(61) 9 9123-4567");

    await usuario.click(screen.getByRole("button", { name: "Voltar" }));
    await titulo("Criar sua conta");
    expect(screen.getByLabelText("Nome completo")).toHaveValue("Maria Souza");
    expect(screen.getByRole("radio", { name: "Não" })).toBeChecked();
  });

  it("preenche o endereço pelo CEP e foca o número", async () => {
    renderizar(<AssistenteCadastro />);
    await preencherAcesso();
    await continuar();
    await titulo("Sobre você");
    await preencherPessoal();
    await continuar();
    await titulo("Onde você mora");

    await usuario.type(screen.getByLabelText("CEP"), "70040010");
    expect(screen.getByLabelText("CEP")).toHaveValue("70040-010");
    await usuario.tab();

    await waitFor(() => expect(screen.getByLabelText("Número")).toHaveFocus());
    expect(screen.getByLabelText("Bairro")).toHaveValue("Asa Sul");
    expect(screen.getByLabelText("Cidade")).toHaveValue("Brasília");
    expect(screen.getByLabelText("UF")).toHaveValue("DF");
    expect(screen.getByText("Endereço encontrado. Confira e complete o número.")).toBeVisible();
  });

  it("orienta o preenchimento manual quando o CEP não existe", async () => {
    renderizar(<AssistenteCadastro />);
    await preencherAcesso();
    await continuar();
    await titulo("Sobre você");
    await preencherPessoal();
    await continuar();
    await titulo("Onde você mora");

    await usuario.type(screen.getByLabelText("CEP"), "99999999");
    await usuario.tab();

    expect(
      await screen.findByText("CEP não encontrado. Preencha o endereço manualmente."),
    ).toBeVisible();
    expect(screen.getByLabelText("Logradouro")).toHaveValue("");
  });

  it("leva o erro 422 ao passo do campo e foca o campo", async () => {
    servidor.use(
      http.post("*/api/auth/cadastro", () =>
        HttpResponse.json(
          {
            codigo: "DADOS_INVALIDOS",
            campos: { telefone: ["telefone deve ter DDD e 8 ou 9 dígitos"], cargo: ["inválido"] },
          },
          { status: 422 },
        ),
      ),
    );
    renderizar(<AssistenteCadastro />);
    await chegarAoUltimoPasso();

    await usuario.click(screen.getByRole("button", { name: "Criar conta" }));

    await titulo("Sobre você");
    expect(screen.getByText("telefone deve ter DDD e 8 ou 9 dígitos")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText("Telefone")).toHaveFocus());
    expect(roteadorFalso.push).not.toHaveBeenCalled();
  });

  it("mostra o erro genérico no último passo sem perder os dados", async () => {
    servidor.use(http.post("*/api/auth/cadastro", () => new HttpResponse(null, { status: 500 })));
    renderizar(<AssistenteCadastro />);
    await chegarAoUltimoPasso();

    await usuario.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível concluir a ação. Tente novamente.",
    );
    expect(screen.getByLabelText("Cargo")).toHaveValue("Gerente de Projetos");
    expect(
      screen.getByText(
        "Ao criar a conta, enviaremos um código de 6 dígitos para confirmar seu e-mail.",
      ),
    ).toBeVisible();
  });

  it("abre os termos em nova aba e oferece o login", () => {
    renderizar(<AssistenteCadastro />);

    expect(screen.getByRole("link", { name: /Termos de Uso/ })).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/login");
  });
});
