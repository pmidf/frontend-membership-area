import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ExigeAdmin } from "@/shared/sessao/ExigeAdmin";
import { perfilAdmin, perfilFiliado, perfilPendente } from "@/test/fixtures/pessoas";
import { definirNavegacao } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import type { PessoaDetalheAdmin } from "../api/pessoas-admin.api";
import { handlersDetalhePessoa, pessoaDetalheTeste } from "../mocks/pessoas-admin.handlers";
import { PaginaDetalhePessoa } from "./PaginaDetalhePessoa";

let usuario: ReturnType<typeof userEvent.setup>;
let requisicoes: { caminho: string; corpo: unknown }[];

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
  requisicoes = [];
  servidor.events.on("request:start", async ({ request }) => {
    if (request.method !== "POST" || !request.url.includes("/api/admin/pessoas/")) return;
    const texto = await request.clone().text();
    requisicoes.push({
      caminho: new URL(request.url).pathname.split("/").at(-1) ?? "",
      corpo: texto ? JSON.parse(texto) : undefined,
    });
  });
});

afterEach(() => servidor.events.removeAllListeners());

function abrir(pessoa: PessoaDetalheAdmin = pessoaDetalheTeste, consulta = "") {
  definirNavegacao(`/admin/pessoas/${pessoa.id_pessoa}`, consulta, { id: pessoa.id_pessoa });
  renderizar(
    <ExigeAdmin>
      <PaginaDetalhePessoa />
    </ExigeAdmin>,
    { sessao: perfilAdmin },
  );
  servidor.use(...handlersDetalhePessoa(pessoa));
}

const carregada = () => screen.findByRole("heading", { name: "Situação da conta" });
const regiao = (nome: string) => within(screen.getByRole("region", { name: nome }));

async function abrirSuspensao() {
  await carregada();
  await usuario.click(screen.getByRole("button", { name: "Suspender conta" }));
  return within(screen.getByRole("dialog", { name: "Suspender conta?" }));
}

function responderSuspender(status: number, corpo: object) {
  servidor.use(
    http.post("*/api/admin/pessoas/:id/suspender", () => HttpResponse.json(corpo, { status })),
  );
}

describe("Detalhe da pessoa", () => {
  it("mostra cabeçalho, dados pessoais, filiação, sessões e situação da conta", async () => {
    abrir({
      ...pessoaDetalheTeste,
      bol_voluntario: true,
      mini_bio: "Gerente de obras.",
    });
    await carregada();

    expect(screen.getByRole("heading", { name: "Bruno Tavares", level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Não-Filiado")).toBeInTheDocument();
    expect(screen.getByText("Voluntário(a)")).toBeInTheDocument();
    expect(screen.getByText("Cadastrado em 30/08/2026")).toBeInTheDocument();

    const dados = regiao("Dados pessoais");
    expect(dados.getByText("(61) 9 9123-4567")).toBeInTheDocument();
    expect(dados.getByText("12/05/1990")).toBeInTheDocument();
    expect(dados.getByText("Feminino")).toBeInTheDocument();
    expect(dados.getByText("Especialização / MBA")).toBeInTheDocument();
    expect(dados.getByText("Gerente de obras.")).toBeInTheDocument();
    expect(
      dados.getByText(
        "SBS Quadra 2, Bloco A, 1058, Sala 1204 — Asa Sul, Brasília/DF — CEP 70040-010",
      ),
    ).toBeInTheDocument();
    expect(dados.getByRole("link", { name: /linkedin\.com/ })).toHaveAttribute(
      "href",
      "https://linkedin.com/in/mariasouza",
    );

    expect(regiao("Filiação PMI").getByText("Não vinculado")).toBeInTheDocument();
    const sessoes = regiao("Sessões ativas");
    expect(sessoes.getByText("Chrome no Android")).toBeInTheDocument();
    expect(sessoes.queryByRole("button")).not.toBeInTheDocument();
    expect(regiao("Situação da conta").getByText("Conta ativa")).toBeInTheDocument();
  });

  it("marca os dados que vêm do PMI e mostra a filiação do ponto de vista do Admin", async () => {
    abrir({
      ...pessoaDetalheTeste,
      papeis: perfilFiliado.papeis,
      filiacao: perfilFiliado.filiacao,
    });
    await carregada();

    const dados = regiao("Dados pessoais");
    expect(dados.getAllByText("Dado sincronizado da base do PMI")).toHaveLength(2);
    expect(screen.getByText("Filiado")).toBeInTheDocument();
    const filiacao = regiao("Filiação PMI");
    expect(filiacao.getByText("Filiado PMI-DF")).toBeInTheDocument();
    expect(filiacao.getByText("C219")).toBeInTheDocument();
    expect(filiacao.getByText("31/03/2027")).toBeInTheDocument();
  });

  it("não fala com a pessoa na filiação pendente e mostra o motivo", async () => {
    abrir({ ...pessoaDetalheTeste, filiacao: perfilPendente.filiacao });
    await carregada();

    const filiacao = regiao("Filiação PMI");
    expect(filiacao.getByText("Não localizado na base do PMI")).toBeInTheDocument();
    expect(filiacao.queryByText(/você|sua filiação/i)).not.toBeInTheDocument();
  });

  it("mostra quando a pessoa não tem sessões nem telefone de LinkedIn", async () => {
    abrir({ ...pessoaDetalheTeste, sessoes_ativas: [], linkedin_url: null });
    await carregada();

    expect(screen.getByText("Nenhuma sessão ativa.")).toBeInTheDocument();
    expect(regiao("Dados pessoais").queryByRole("link")).not.toBeInTheDocument();
  });
});

describe("Suspender e reativar", () => {
  it("exige motivo de 5 caracteres para habilitar a confirmação", async () => {
    abrir();
    const dialogo = await abrirSuspensao();
    const confirmar = dialogo.getByRole("button", { name: "Suspender conta" });

    expect(confirmar).toBeDisabled();
    await usuario.type(dialogo.getByLabelText("Motivo"), "abcd");
    expect(confirmar).toBeDisabled();
    await usuario.type(dialogo.getByLabelText("Motivo"), "e");
    expect(confirmar).toBeEnabled();
  });

  it("suspende com motivo, troca o selo e o botão, e reativa em seguida", async () => {
    abrir();
    const dialogo = await abrirSuspensao();

    await usuario.type(dialogo.getByLabelText("Motivo"), "  Uso indevido da conta ");
    await usuario.click(dialogo.getByRole("button", { name: "Suspender conta" }));

    expect(await regiao("Situação da conta").findByText("Conta suspensa")).toBeInTheDocument();
    expect(requisicoes).toEqual([
      { caminho: "suspender", corpo: { motivo: "Uso indevido da conta" } },
    ]);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("Nenhuma sessão ativa.")).toBeInTheDocument();

    await usuario.click(screen.getByRole("button", { name: "Reativar conta" }));
    const reativar = within(screen.getByRole("dialog", { name: "Reativar conta?" }));
    await usuario.click(reativar.getByRole("button", { name: "Reativar conta" }));

    expect(await regiao("Situação da conta").findByText("Conta ativa")).toBeInTheDocument();
    expect(requisicoes.at(-1)).toEqual({ caminho: "reativar", corpo: undefined });

    const novaSuspensao = await abrirSuspensao();
    expect(novaSuspensao.getByLabelText("Motivo")).toHaveValue("");
  });

  it.each([
    ["AUTOSSUSPENSAO", "Você não pode suspender a própria conta."],
    ["ULTIMO_ADMIN", "Esta pessoa é o único administrador ativo e não pode ser suspensa."],
  ])("explica %s no diálogo", async (codigo, mensagem) => {
    abrir();
    const dialogo = await abrirSuspensao();
    responderSuspender(409, { codigo });

    await usuario.type(dialogo.getByLabelText("Motivo"), "Motivo válido");
    await usuario.click(dialogo.getByRole("button", { name: "Suspender conta" }));

    expect(await dialogo.findByText(mensagem)).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Suspender conta?" })).toBeInTheDocument();
  });

  it("mostra a validação do backend para o motivo", async () => {
    abrir();
    const dialogo = await abrirSuspensao();
    responderSuspender(422, { codigo: "DADOS_INVALIDOS", campos: { motivo: ["Motivo recusado"] } });

    await usuario.type(dialogo.getByLabelText("Motivo"), "Motivo válido");
    await usuario.click(dialogo.getByRole("button", { name: "Suspender conta" }));

    expect(await dialogo.findByText("Motivo recusado")).toBeInTheDocument();
  });

  it("limpa o erro ao fechar o diálogo", async () => {
    abrir();
    let dialogo = await abrirSuspensao();
    responderSuspender(409, { codigo: "ULTIMO_ADMIN" });
    await usuario.type(dialogo.getByLabelText("Motivo"), "Motivo válido");
    await usuario.click(dialogo.getByRole("button", { name: "Suspender conta" }));
    await dialogo.findByText(/único administrador/);

    await usuario.click(dialogo.getByRole("button", { name: "Cancelar" }));
    dialogo = await abrirSuspensao();

    expect(dialogo.queryByText(/único administrador/)).not.toBeInTheDocument();
  });

  it("mostra o erro da reativação no diálogo", async () => {
    abrir({ ...pessoaDetalheTeste, situacao_conta: "SUSPENSA" });
    await carregada();
    servidor.use(
      http.post("*/api/admin/pessoas/:id/reativar", () => HttpResponse.json({}, { status: 500 })),
    );

    await usuario.click(screen.getByRole("button", { name: "Reativar conta" }));
    const dialogo = within(screen.getByRole("dialog", { name: "Reativar conta?" }));
    await usuario.click(dialogo.getByRole("button", { name: "Reativar conta" }));

    expect(
      await dialogo.findByText("Não foi possível concluir a ação. Tente novamente."),
    ).toBeInTheDocument();
  });

  it("não oferece suspender a própria conta", async () => {
    abrir({ ...pessoaDetalheTeste, id_pessoa: perfilAdmin.id_pessoa });
    await carregada();

    expect(screen.queryByRole("button", { name: "Suspender conta" })).not.toBeInTheDocument();
    expect(screen.getByText("Você não pode suspender a própria conta.")).toBeInTheDocument();
  });
});

describe("Navegação e estados", () => {
  it("volta para a lista mantendo a busca e a página", async () => {
    abrir(pessoaDetalheTeste, "busca=bruno&pagina=2");
    await carregada();

    expect(screen.getByRole("link", { name: "Voltar para Pessoas" })).toHaveAttribute(
      "href",
      "/admin/pessoas?busca=bruno&pagina=2",
    );
  });

  it("volta para a lista sem parâmetros quando não havia busca", async () => {
    abrir();
    await carregada();

    expect(screen.getByRole("link", { name: "Voltar para Pessoas" })).toHaveAttribute(
      "href",
      "/admin/pessoas",
    );
  });

  it.each([400, 404])("mostra pessoa não encontrada com status %i", async (status) => {
    abrir();
    servidor.use(http.get("*/api/admin/pessoas/:id", () => HttpResponse.json({}, { status })));

    expect(await screen.findByText("Pessoa não encontrada")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Voltar para Pessoas" })).toHaveLength(2);
  });

  it("mostra erro e tenta de novo", async () => {
    let falhar = true;
    abrir();
    servidor.use(
      http.get("*/api/admin/pessoas/:id", () =>
        falhar ? HttpResponse.json({}, { status: 500 }) : HttpResponse.json(pessoaDetalheTeste),
      ),
    );

    expect(
      await screen.findByText(
        "Não foi possível carregar os dados da pessoa.",
        {},
        { timeout: 4000 },
      ),
    ).toBeInTheDocument();
    falhar = false;
    await usuario.click(screen.getByRole("button", { name: "Tentar novamente" }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Bruno Tavares" })).toBeInTheDocument(),
    );
  });
});
