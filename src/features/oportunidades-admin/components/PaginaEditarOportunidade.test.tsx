import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { perfilAdmin } from "@/test/fixtures/pessoas";
import { definirNavegacao, roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import {
  handlersOportunidadesAdmin,
  ID_DUPLICADA,
  oportunidadeEncerrada,
  oportunidadePublicada,
  oportunidadeRascunho,
} from "../mocks/oportunidades-admin.handlers";
import type { OportunidadeAdmin } from "../tipos/oportunidade-admin";
import { PaginaEditarOportunidade } from "./PaginaEditarOportunidade";

const ESPERA = 4000;

let usuario: ReturnType<typeof userEvent.setup>;
let chamadas: { metodo: string; caminho: string; corpo: unknown }[];

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
  chamadas = [];
  servidor.events.on("request:start", async ({ request }) => {
    const { pathname } = new URL(request.url);
    if (!pathname.startsWith("/api/admin/oportunidades")) return;
    const texto = await request.clone().text();
    chamadas.push({
      metodo: request.method,
      caminho: pathname,
      corpo: texto && JSON.parse(texto),
    });
  });
});

afterEach(() => servidor.events.removeAllListeners());

async function abrir(oportunidade: OportunidadeAdmin = oportunidadeRascunho, consulta = "") {
  const id = oportunidade.id_oportunidade;
  definirNavegacao(`/admin/vagas/${id}`, consulta, { id });
  renderizar(<PaginaEditarOportunidade />, { sessao: perfilAdmin });
  servidor.use(...handlersOportunidadesAdmin([oportunidade]));
  await screen.findByRole("heading", { level: 1, name: "Edição de vaga" }, { timeout: ESPERA });
}

const avisos = () => within(screen.getByRole("region", { name: "Avisos" }));
const botao = (nome: string) => screen.getByRole("button", { name: nome });
const escritas = () => chamadas.filter(({ metodo }) => metodo !== "GET");

async function substituir(rotulo: string, valor: string) {
  const campo = screen.getByLabelText(rotulo);
  await usuario.clear(campo);
  await usuario.type(campo, valor);
}

describe("Edição de vaga", { timeout: 15_000 }, () => {
  it("preenche o formulário com o rascunho salvo", async () => {
    await abrir();

    expect(screen.getByLabelText("Título da vaga")).toHaveValue("Analista de Projetos Júnior");
    expect(screen.getByRole("radio", { name: /Link de candidatura/ })).toBeChecked();
    expect(screen.getByLabelText("URL de candidatura")).toHaveValue(
      "https://smartkanvas.com.br/vagas/analista",
    );
    expect(screen.getByRole("radio", { name: /Híbrido/ })).toBeChecked();
    expect(screen.getByText("Rascunho", { selector: "header *" })).toBeInTheDocument();
    expect(botao("Salvar como rascunho")).toBeDisabled();
  });

  it("salva só o que mudou", async () => {
    await abrir();
    await substituir("Título da vaga", "Analista de Projetos Pleno");

    await usuario.click(botao("Salvar como rascunho"));

    expect(await avisos().findByText("Rascunho salvo")).toBeInTheDocument();
    expect(escritas()).toEqual([
      {
        metodo: "PATCH",
        caminho: `/api/admin/oportunidades/${oportunidadeRascunho.id_oportunidade}`,
        corpo: { titulo: "Analista de Projetos Pleno" },
      },
    ]);
  });

  it("ao trocar o meio, envia o e-mail e zera o link", async () => {
    await abrir();
    await usuario.click(screen.getByRole("radio", { name: /E-mail do recrutador/ }));
    await usuario.type(screen.getByLabelText("E-mail do recrutador"), "rh@smartkanvas.com.br");

    await usuario.click(botao("Salvar como rascunho"));

    await waitFor(() => expect(escritas()).toHaveLength(1));
    expect(escritas()[0].corpo).toEqual({
      url_candidatura: null,
      email_recrutador: "rh@smartkanvas.com.br",
    });
  });

  it("mostra no campo o erro 422 ao salvar", async () => {
    await abrir();
    servidor.use(
      http.patch("*/api/admin/oportunidades/:id", () =>
        HttpResponse.json(
          { codigo: "DADOS_INVALIDOS", campos: { titulo: ["Título já usado"] } },
          { status: 422 },
        ),
      ),
    );
    await substituir("Título da vaga", "Outro título");

    await usuario.click(botao("Salvar como rascunho"));

    expect(await screen.findByText("Título já usado")).toBeInTheDocument();
  });

  it("pré-visualiza a vaga no formato do filiado", async () => {
    await abrir();

    await usuario.click(botao("Pré-visualizar"));

    const modal = await screen.findByRole("dialog", { name: "Pré-visualização" });
    expect(
      await within(modal).findByRole("heading", { name: "Analista de Projetos Júnior" }),
    ).toBeInTheDocument();
    expect(within(modal).getByText("Apoiar o PMO no acompanhamento de cronogramas.")).toBeVisible();
    expect(within(modal).getByText("Ainda não publicada")).toBeInTheDocument();
    expect(within(modal).getByText("60 dias após a publicação")).toBeInTheDocument();
    expect(within(modal).getByRole("img", { name: "Logo da SmartKanvas" })).toHaveTextContent("S");
    expect(escritas()).toHaveLength(0);

    await usuario.click(within(modal).getByRole("button", { name: "Fechar" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("abre a prévia quando chega da criação e limpa o parâmetro da URL", async () => {
    await abrir(oportunidadeRascunho, "previa=1");

    const modal = await screen.findByRole("dialog", { name: "Pré-visualização" });
    expect(
      await within(modal).findByRole("heading", { name: "Analista de Projetos Júnior" }),
    ).toBeInTheDocument();
    expect(roteadorFalso.replace).toHaveBeenCalledWith(
      `/admin/vagas/${oportunidadeRascunho.id_oportunidade}`,
    );
  });

  it("não abre a prévia sem o parâmetro na URL", async () => {
    await abrir();

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(roteadorFalso.replace).not.toHaveBeenCalled();
  });

  it("salva as alterações antes de pré-visualizar", async () => {
    await abrir();
    await substituir("Título da vaga", "Analista de Projetos Pleno");

    await usuario.click(botao("Pré-visualizar"));

    const modal = await screen.findByRole("dialog", { name: "Pré-visualização" });
    expect(
      await within(modal).findByRole("heading", { name: "Analista de Projetos Pleno" }),
    ).toBeInTheDocument();
    expect(escritas().map(({ metodo }) => metodo)).toEqual(["PATCH"]);
  });

  it("mostra erro quando a pré-visualização falha", async () => {
    await abrir();
    servidor.use(
      http.get("*/api/admin/oportunidades/:id/preview", () =>
        HttpResponse.json({}, { status: 500 }),
      ),
    );

    await usuario.click(botao("Pré-visualizar"));

    expect(
      await screen.findByText("Não foi possível carregar a pré-visualização."),
    ).toBeInTheDocument();
  });

  it("publica, avisa e passa a mostrar as ações de vaga publicada", async () => {
    await abrir();

    await usuario.click(botao("Publicar vaga"));

    expect(await avisos().findByText("Vaga publicada")).toBeInTheDocument();
    expect(escritas()).toEqual([
      expect.objectContaining({
        metodo: "POST",
        caminho: `/api/admin/oportunidades/${oportunidadeRascunho.id_oportunidade}/publicar`,
      }),
    ]);
    expect(await screen.findByRole("button", { name: "Encerrar vaga" })).toBeInTheDocument();
    expect(screen.getByText("15/11/2026")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Publicar vaga" })).toBeNull();
  });

  it("avisa com a mensagem do código quando a vaga já não é rascunho", async () => {
    await abrir();
    servidor.use(
      http.post("*/api/admin/oportunidades/:id/publicar", () =>
        HttpResponse.json({ codigo: "OPORTUNIDADE_NAO_E_RASCUNHO" }, { status: 409 }),
      ),
    );

    await usuario.click(botao("Publicar vaga"));

    expect(await avisos().findByText("Só rascunhos podem ser publicados.")).toBeInTheDocument();
  });

  it("edita vaga publicada enviando só o campo alterado", async () => {
    await abrir(oportunidadePublicada);
    expect(screen.queryByRole("button", { name: "Publicar vaga" })).toBeNull();
    expect(botao("Pré-visualizar")).toBeInTheDocument();
    expect(botao("Duplicar")).toBeInTheDocument();

    await substituir("Empresa", "Instituto de Gestão");
    await usuario.click(botao("Salvar alterações"));

    expect(await avisos().findByText("Vaga atualizada")).toBeInTheDocument();
    expect(escritas()).toEqual([
      expect.objectContaining({ metodo: "PATCH", corpo: { empresa: "Instituto de Gestão" } }),
    ]);
  });

  it("encerra com motivo e passa a mostrar a vaga somente leitura", async () => {
    await abrir(oportunidadePublicada);

    await usuario.click(botao("Encerrar vaga"));
    const dialogo = screen.getByRole("dialog", { name: "Encerrar vaga?" });
    await usuario.type(
      within(dialogo).getByLabelText("Motivo do encerramento (opcional)"),
      "Vaga preenchida",
    );
    await usuario.click(within(dialogo).getByRole("button", { name: "Encerrar vaga" }));

    expect(await avisos().findByText("Vaga encerrada")).toBeInTheDocument();
    expect(escritas()).toEqual([
      {
        metodo: "POST",
        caminho: `/api/admin/oportunidades/${oportunidadePublicada.id_oportunidade}/encerrar`,
        corpo: { motivo_encerramento: "Vaga preenchida" },
      },
    ]);
    expect(await screen.findByText("Vaga preenchida")).toBeInTheDocument();
    expect(screen.getByLabelText("Título da vaga")).toBeDisabled();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("encerra sem motivo mandando o corpo vazio", async () => {
    await abrir(oportunidadePublicada);

    await usuario.click(botao("Encerrar vaga"));
    const dialogo = screen.getByRole("dialog", { name: "Encerrar vaga?" });
    await usuario.click(within(dialogo).getByRole("button", { name: "Encerrar vaga" }));

    await waitFor(() => expect(escritas()).toHaveLength(1));
    expect(escritas()[0].corpo).toEqual({});
  });

  it("duplica e leva para o novo rascunho", async () => {
    await abrir(oportunidadePublicada);

    await usuario.click(botao("Duplicar"));

    await waitFor(() =>
      expect(roteadorFalso.push).toHaveBeenCalledWith(`/admin/vagas/${ID_DUPLICADA}`),
    );
    expect(avisos().getByText("Rascunho criado")).toBeInTheDocument();
  });

  it("mostra vaga encerrada somente leitura, com data e motivo", async () => {
    await abrir(oportunidadeEncerrada);

    expect(screen.getByText("Encerrada", { selector: "header *" })).toBeInTheDocument();
    expect(screen.getByText("20/10/2026")).toBeInTheDocument();
    expect(screen.getByText("Vaga preenchida")).toBeInTheDocument();
    expect(screen.getByLabelText("Título da vaga")).toBeDisabled();
    expect(screen.getByLabelText("URL de candidatura")).toBeDisabled();
    expect(screen.queryByText("Cadastro mínimo")).toBeNull();
    expect(screen.queryByRole("button", { name: "Salvar alterações" })).toBeNull();
    expect(botao("Duplicar como rascunho")).toBeInTheDocument();
  });

  it("recarrega como encerrada quando o backend recusa a edição", async () => {
    await abrir(oportunidadePublicada);
    servidor.use(
      http.patch("*/api/admin/oportunidades/:id", () =>
        HttpResponse.json({ codigo: "OPORTUNIDADE_ENCERRADA" }, { status: 409 }),
      ),
      http.get("*/api/admin/oportunidades/:id", () =>
        HttpResponse.json({ ...oportunidadePublicada, situacao: "ENCERRADA" }),
      ),
    );
    await substituir("Empresa", "Outra");

    await usuario.click(botao("Salvar alterações"));

    expect(await avisos().findByText("Esta vaga foi encerrada.")).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Duplicar como rascunho" })).toBeVisible();
  });

  it("volta para a lista preservando os filtros", async () => {
    await abrir(oportunidadePublicada, "situacao=PUBLICADA&previa=1");

    expect(screen.getByRole("link", { name: "Voltar para vagas" })).toHaveAttribute(
      "href",
      "/admin/vagas?situacao=PUBLICADA",
    );
    expect(roteadorFalso.replace).toHaveBeenCalledWith(
      `/admin/vagas/${oportunidadePublicada.id_oportunidade}?situacao=PUBLICADA`,
    );
  });

  it("mostra estado de vaga não encontrada", async () => {
    definirNavegacao("/admin/vagas/x", "", { id: "x" });
    renderizar(<PaginaEditarOportunidade />, { sessao: perfilAdmin });
    servidor.use(...handlersOportunidadesAdmin());

    expect(await screen.findByText("Vaga não encontrada", {}, { timeout: ESPERA })).toBeVisible();
    expect(screen.getByRole("link", { name: "Voltar para vagas" })).toHaveAttribute(
      "href",
      "/admin/vagas",
    );
  });

  it("mostra erro com tentar de novo quando o carregamento falha", async () => {
    definirNavegacao("/admin/vagas/x", "", { id: "x" });
    renderizar(<PaginaEditarOportunidade />, { sessao: perfilAdmin });
    servidor.use(
      http.get("*/api/admin/oportunidades/:id", () => HttpResponse.json({}, { status: 500 })),
    );

    expect(
      await screen.findByText("Não foi possível carregar a vaga.", {}, { timeout: ESPERA }),
    ).toBeVisible();
  });
});
