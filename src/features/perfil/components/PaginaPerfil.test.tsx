import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { chavesSessao } from "@/shared/sessao/sessao.api";
import type { Perfil } from "@/shared/sessao/tipos";
import { perfilFiliado, perfilNaoFiliado } from "@/test/fixtures/pessoas";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { handlersPerfil } from "../mocks/perfil.handlers";
import { PaginaPerfil } from "./PaginaPerfil";

let usuario: ReturnType<typeof userEvent.setup>;
let corpos: unknown[];
let consultasCep: string[];

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
  corpos = [];
  consultasCep = [];
  servidor.events.on("request:start", async ({ request }) => {
    if (request.url.includes("viacep")) consultasCep.push(request.url);
    if (request.method === "PATCH") corpos.push(await request.clone().json());
  });
});

afterEach(() => servidor.events.removeAllListeners());

async function renderizarPagina(perfil: Perfil = perfilNaoFiliado) {
  const resultado = renderizar(<PaginaPerfil />, { sessao: perfil });
  servidor.use(...handlersPerfil(perfil));
  await screen.findByRole("heading", { name: "Dados pessoais" });
  return resultado;
}

const botaoSalvar = () => screen.getByRole("button", { name: "Salvar alterações" });
const avisos = () => within(screen.getByRole("region", { name: "Avisos" }));

async function substituir(rotulo: string, valor: string) {
  const campo = screen.getByLabelText(rotulo);
  await usuario.clear(campo);
  await usuario.type(campo, valor);
}

function responderPatch(status: number, corpo: object) {
  servidor.use(http.patch("*/api/me", () => HttpResponse.json(corpo, { status })));
}

describe("Dados pessoais", () => {
  it("preenche o formulário com os valores de /api/me", async () => {
    await renderizarPagina();

    expect(screen.getByLabelText("Nome completo")).toHaveValue("Rafael Souza");
    expect(screen.getByLabelText("E-mail principal")).toHaveValue(
      "rafael.souza@teste.pmidf.org.br",
    );
    expect(screen.getByLabelText("E-mail principal")).toHaveAttribute("readonly");
    expect(screen.getByLabelText("Telefone")).toHaveValue("(61) 9 9123-4567");
    expect(screen.getByLabelText("Data de nascimento")).toHaveValue("1990-05-12");
    expect(screen.getByLabelText("Gênero")).toHaveValue("FEMININO");
    expect(screen.getByLabelText("Escolaridade")).toHaveValue("ESPECIALIZACAO_MBA");
    expect(screen.getByLabelText("CEP")).toHaveValue("70040-010");
    expect(screen.getByLabelText("UF")).toHaveValue("DF");
  });

  it("deixa o nome do Filiado somente leitura, com a nota do PMI", async () => {
    await renderizarPagina(perfilFiliado);

    expect(screen.getByLabelText("Nome completo")).toHaveAttribute("readonly");
    expect(
      screen.getByText(
        "Sincronizado da base do PMI — para corrigir, atualize seu cadastro no PMI Global.",
      ),
    ).toBeInTheDocument();
  });

  it("deixa o nome do Não-Filiado editável", async () => {
    await renderizarPagina();

    expect(screen.getByLabelText("Nome completo")).not.toHaveAttribute("readonly");
    expect(screen.queryByText(/Sincronizado da base do PMI/)).not.toBeInTheDocument();
  });

  it("mantém o botão desabilitado enquanto nada mudou", async () => {
    await renderizarPagina();

    expect(botaoSalvar()).toBeDisabled();
    await substituir("Cargo", "Diretor");
    expect(botaoSalvar()).toBeEnabled();
    await substituir("Cargo", perfilNaoFiliado.cargo);
    expect(botaoSalvar()).toBeDisabled();
  });

  it("envia só os campos alterados e volta ao estado sem alterações", async () => {
    await renderizarPagina();

    await substituir("Telefone", "61988887777");
    await substituir("Cargo", "Diretor de Projetos");
    await usuario.click(botaoSalvar());

    expect(await avisos().findByText("Dados atualizados.")).toBeInTheDocument();
    expect(corpos).toEqual([{ telefone: "61988887777", cargo: "Diretor de Projetos" }]);
    await waitFor(() => expect(botaoSalvar()).toBeDisabled());
    expect(screen.getByLabelText("Cargo")).toHaveValue("Diretor de Projetos");
  });

  it("recusa menor de 18 anos e LinkedIn de outro domínio sem enviar nada", async () => {
    await renderizarPagina();

    await substituir("Data de nascimento", "2020-01-01");
    await substituir("LinkedIn (opcional)", "https://exemplo.com/rafael");
    await usuario.click(botaoSalvar());

    expect(await screen.findByText("É preciso ter 18 anos ou mais")).toBeInTheDocument();
    expect(screen.getByText(/Use o endereço completo do seu perfil/)).toBeInTheDocument();
    expect(corpos).toEqual([]);
  });

  it("envia nulo ao limpar o LinkedIn", async () => {
    await renderizarPagina();

    await usuario.clear(screen.getByLabelText("LinkedIn (opcional)"));
    await usuario.click(botaoSalvar());

    await avisos().findByText("Dados atualizados.");
    expect(corpos).toEqual([{ linkedin_url: null }]);
  });

  it("atualiza o perfil da sessão, sem nova consulta, ao salvar o nome", async () => {
    const { clienteConsultas } = await renderizarPagina();

    await substituir("Nome completo", "Rafael Souza Lima");
    await usuario.click(botaoSalvar());

    await avisos().findByText("Dados atualizados.");
    expect(clienteConsultas.getQueryData<Perfil>(chavesSessao.perfil)?.nome_completo).toBe(
      "Rafael Souza Lima",
    );
    expect(screen.getByRole("heading", { name: "Rafael Souza Lima" })).toBeInTheDocument();
  });

  it("preenche o endereço quando o CEP muda", async () => {
    await renderizarPagina({ ...perfilNaoFiliado, cep: "71000000", logradouro: "Rua antiga" });

    await substituir("CEP", "70040010");
    await usuario.tab();

    await waitFor(() => expect(screen.getByLabelText("Logradouro")).toHaveValue("SBS Quadra 2"));
    expect(screen.getByLabelText("Bairro")).toHaveValue("Asa Sul");
    expect(screen.getByLabelText("Número")).toHaveFocus();
    expect(botaoSalvar()).toBeEnabled();
  });

  it("não consulta o CEP nem altera o endereço ao sair do campo sem mudar", async () => {
    await renderizarPagina();

    await usuario.click(screen.getByLabelText("CEP"));
    await usuario.tab();

    expect(consultasCep).toEqual([]);
    expect(screen.getByLabelText("Logradouro")).toHaveValue(perfilNaoFiliado.logradouro);
    expect(botaoSalvar()).toBeDisabled();
  });

  it("mostra os erros de validação do backend nos campos", async () => {
    await renderizarPagina();
    responderPatch(422, { codigo: "DADOS_INVALIDOS", campos: { cargo: ["Cargo recusado"] } });

    await substituir("Cargo", "X");
    await usuario.click(botaoSalvar());

    expect(await screen.findByText("Cargo recusado")).toBeInTheDocument();
  });

  it("mostra NOME_DEFINIDO_PELO_PMI no campo de nome", async () => {
    await renderizarPagina();
    responderPatch(409, { codigo: "NOME_DEFINIDO_PELO_PMI" });

    await substituir("Nome completo", "Outro Nome");
    await usuario.click(botaoSalvar());

    expect(
      await screen.findByText("O nome vem da base do PMI e não pode ser alterado aqui."),
    ).toBeInTheDocument();
  });

  it("avisa do erro do servidor e mantém as alterações", async () => {
    await renderizarPagina();
    responderPatch(500, {});

    await substituir("Cargo", "Diretor");
    await usuario.click(botaoSalvar());

    expect(
      await avisos().findByText("Não foi possível concluir a ação. Tente novamente."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Cargo")).toHaveValue("Diretor");
    expect(botaoSalvar()).toBeEnabled();
  });
});

describe("Cabeçalho e mini bio", () => {
  async function abrirModal() {
    await usuario.click(screen.getByRole("button", { name: "Editar mini bio" }));
    return screen.getByRole("dialog", { name: "Editar mini bio" });
  }

  it("mostra selo e convite do Não-Filiado sem mini bio", async () => {
    await renderizarPagina();

    expect(screen.getByRole("heading", { name: "Rafael Souza" })).toBeInTheDocument();
    expect(screen.getByText("Não-Filiado")).toBeInTheDocument();
    expect(screen.getByText(/Adicione uma mini bio/)).toBeInTheDocument();
  });

  it("mostra selo do Filiado e a mini bio como texto simples", async () => {
    await renderizarPagina({ ...perfilFiliado, mini_bio: "<b>Gerencio</b> obras." });

    expect(screen.getAllByText("Filiado PMI-DF")).toHaveLength(2);
    expect(screen.getByText("<b>Gerencio</b> obras.")).toBeInTheDocument();
    expect(screen.queryByText(/Adicione uma mini bio/)).not.toBeInTheDocument();
  });

  it("limita a mini bio a 600 caracteres", async () => {
    await renderizarPagina();
    const dialogo = await abrirModal();
    const campo = within(dialogo).getByLabelText("Mini bio");

    await usuario.click(campo);
    await usuario.paste("a".repeat(650));

    expect(campo).toHaveValue("a".repeat(600));
    expect(within(dialogo).getByText("600/600")).toBeInTheDocument();
  });

  it("salva a mini bio e mostra o novo texto no cabeçalho", async () => {
    await renderizarPagina();
    const dialogo = await abrirModal();

    await usuario.type(within(dialogo).getByLabelText("Mini bio"), "  Gerente de obras. ");
    await usuario.click(within(dialogo).getByRole("button", { name: "Salvar" }));

    expect(await avisos().findByText("Mini bio atualizada.")).toBeInTheDocument();
    expect(corpos).toEqual([{ mini_bio: "Gerente de obras." }]);
    expect(screen.getByText("Gerente de obras.")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("envia nulo ao apagar a mini bio", async () => {
    await renderizarPagina({ ...perfilNaoFiliado, mini_bio: "Texto antigo" });
    const dialogo = await abrirModal();

    await usuario.clear(within(dialogo).getByLabelText("Mini bio"));
    await usuario.click(within(dialogo).getByRole("button", { name: "Salvar" }));

    await avisos().findByText("Mini bio atualizada.");
    expect(corpos).toEqual([{ mini_bio: null }]);
  });

  it("fecha sem enviar quando nada mudou ou ao cancelar", async () => {
    await renderizarPagina({ ...perfilNaoFiliado, mini_bio: "Texto" });

    let dialogo = await abrirModal();
    await usuario.click(within(dialogo).getByRole("button", { name: "Salvar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    dialogo = await abrirModal();
    await usuario.type(within(dialogo).getByLabelText("Mini bio"), " novo");
    await usuario.click(within(dialogo).getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    expect(corpos).toEqual([]);
  });

  it("mostra o erro no campo ou no modal, sem fechar", async () => {
    await renderizarPagina();
    const dialogo = await abrirModal();
    const campo = within(dialogo).getByLabelText("Mini bio");
    const salvar = within(dialogo).getByRole("button", { name: "Salvar" });

    responderPatch(422, { codigo: "DADOS_INVALIDOS", campos: { mini_bio: ["Texto recusado"] } });
    await usuario.type(campo, "Bio");
    await usuario.click(salvar);
    expect(await within(dialogo).findByText("Texto recusado")).toBeInTheDocument();

    responderPatch(500, {});
    await usuario.click(salvar);
    expect(
      await within(dialogo).findByText("Não foi possível concluir a ação. Tente novamente."),
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Editar mini bio" })).toBeInTheDocument();
  });
});
