import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { perfilAdmin } from "@/test/fixtures/pessoas";
import { definirNavegacao, roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { handlersOportunidadesAdmin, ID_CRIADA } from "../mocks/oportunidades-admin.handlers";
import { PaginaNovaOportunidade } from "./PaginaNovaOportunidade";

let usuario: ReturnType<typeof userEvent.setup>;
let chamadas: { caminho: string; corpo: unknown }[];

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
  chamadas = [];
  servidor.events.on("request:start", async ({ request }) => {
    const { pathname } = new URL(request.url);
    if (request.method === "GET" || !pathname.startsWith("/api/admin/oportunidades")) return;
    const texto = await request.clone().text();
    chamadas.push({ caminho: pathname, corpo: texto && JSON.parse(texto) });
  });
});

afterEach(() => servidor.events.removeAllListeners());

async function abrir() {
  definirNavegacao("/admin/vagas/nova");
  renderizar(<PaginaNovaOportunidade />, { sessao: perfilAdmin });
  servidor.use(...handlersOportunidadesAdmin());
  await screen.findByRole("heading", { level: 1, name: "Nova vaga" });
}

const avisos = () => within(screen.getByRole("region", { name: "Avisos" }));
const botao = (nome: string) => screen.getByRole("button", { name: nome });

async function preencherObrigatorios() {
  await usuario.type(screen.getByLabelText("Título da vaga"), "Analista de Projetos Júnior");
  await usuario.type(screen.getByLabelText("Empresa"), "SmartKanvas");
  await usuario.type(screen.getByLabelText("Descrição"), "Apoiar o PMO.");
}

describe("Nova vaga", { timeout: 15_000 }, () => {
  it("salva o rascunho com link e leva para a edição", async () => {
    await abrir();
    await preencherObrigatorios();
    await usuario.type(
      screen.getByLabelText("URL de candidatura"),
      "https://smartkanvas.com.br/vaga",
    );
    await usuario.click(screen.getByRole("radio", { name: /Remoto/ }));
    fireEvent.change(screen.getByLabelText("Data de encerramento"), {
      target: { value: "2099-12-31" },
    });

    await usuario.click(botao("Salvar como rascunho"));

    await waitFor(() =>
      expect(roteadorFalso.push).toHaveBeenCalledWith(`/admin/vagas/${ID_CRIADA}`),
    );
    expect(avisos().getByText("Rascunho salvo")).toBeInTheDocument();
    expect(chamadas).toEqual([
      {
        caminho: "/api/admin/oportunidades",
        corpo: {
          titulo: "Analista de Projetos Júnior",
          empresa: "SmartKanvas",
          descricao: "<p>Apoiar o PMO.</p>",
          url_candidatura: "https://smartkanvas.com.br/vaga",
          email_recrutador: null,
          modalidade: "REMOTO",
          localidade: null,
          logo_empresa: null,
          data_encerramento: "2099-12-31",
        },
      },
    ]);
  });

  it("envia a descrição com parágrafos e lista em HTML básico", async () => {
    await abrir();
    await usuario.type(screen.getByLabelText("Título da vaga"), "Analista");
    await usuario.type(screen.getByLabelText("Empresa"), "SmartKanvas");
    await usuario.type(
      screen.getByLabelText("Descrição"),
      "Apoiar o PMO.{Enter}{Enter}Requisitos:{Enter}- Excel{Enter}- Boa escrita",
    );
    await usuario.type(
      screen.getByLabelText("URL de candidatura"),
      "https://smartkanvas.com.br/vaga",
    );

    await usuario.click(botao("Salvar como rascunho"));

    await waitFor(() => expect(chamadas).toHaveLength(1));
    expect(chamadas[0].corpo).toMatchObject({
      descricao:
        "<p>Apoiar o PMO.</p><p>Requisitos:</p><ul><li>Excel</li><li>Boa escrita</li></ul>",
    });
  });

  it("valida os obrigatórios e o meio de candidatura sem chamar o backend", async () => {
    await abrir();

    await usuario.click(botao("Salvar como rascunho"));

    expect(await screen.findByText("Informe o título")).toBeInTheDocument();
    expect(screen.getByText("Informe a empresa")).toBeInTheDocument();
    expect(screen.getByText("Informe a descrição")).toBeInTheDocument();
    expect(screen.getByText("Informe a URL de candidatura")).toBeInTheDocument();
    expect(chamadas).toHaveLength(0);
  });

  it("recusa link javascript:", async () => {
    await abrir();
    await preencherObrigatorios();
    await usuario.type(screen.getByLabelText("URL de candidatura"), "javascript:alert(1)");

    await usuario.click(botao("Salvar como rascunho"));

    expect(await screen.findByText("Informe uma URL http(s) válida")).toBeInTheDocument();
    expect(chamadas).toHaveLength(0);
  });

  it("ao trocar para e-mail, mostra só o campo de e-mail e manda o link como nulo", async () => {
    await abrir();
    await preencherObrigatorios();
    await usuario.type(
      screen.getByLabelText("URL de candidatura"),
      "https://smartkanvas.com.br/vaga",
    );

    await usuario.click(screen.getByRole("radio", { name: /E-mail do recrutador/ }));

    expect(screen.queryByLabelText("URL de candidatura")).toBeNull();
    await usuario.type(screen.getByLabelText("E-mail do recrutador"), "rh@smartkanvas.com.br");
    await usuario.click(botao("Salvar como rascunho"));

    await waitFor(() => expect(chamadas).toHaveLength(1));
    expect(chamadas[0].corpo).toMatchObject({
      url_candidatura: null,
      email_recrutador: "rh@smartkanvas.com.br",
    });
  });

  it("pré-visualizar salva o rascunho e abre a edição com a prévia", async () => {
    await abrir();
    await preencherObrigatorios();
    await usuario.type(
      screen.getByLabelText("URL de candidatura"),
      "https://smartkanvas.com.br/vaga",
    );

    await usuario.click(botao("Pré-visualizar"));

    await waitFor(() =>
      expect(roteadorFalso.push).toHaveBeenCalledWith(`/admin/vagas/${ID_CRIADA}?previa=1`),
    );
    expect(avisos().getByText("Rascunho salvo")).toBeInTheDocument();
    expect(chamadas.map(({ caminho }) => caminho)).toEqual(["/api/admin/oportunidades"]);
  });

  it("não pré-visualiza com o formulário inválido", async () => {
    await abrir();

    await usuario.click(botao("Pré-visualizar"));

    expect(await screen.findByText("Informe o título")).toBeInTheDocument();
    expect(chamadas).toHaveLength(0);
    expect(roteadorFalso.push).not.toHaveBeenCalled();
  });

  it("permite desfazer a escolha da modalidade", async () => {
    await abrir();
    await usuario.click(screen.getByRole("radio", { name: /Híbrido/ }));

    await usuario.click(botao("Não informar a modalidade"));

    expect(screen.getByRole("radio", { name: /Híbrido/ })).not.toBeChecked();
    expect(screen.queryByRole("button", { name: "Não informar a modalidade" })).toBeNull();
  });

  it("mostra nos campos os erros de validação do backend", async () => {
    await abrir();
    servidor.use(
      http.post("*/api/admin/oportunidades", () =>
        HttpResponse.json(
          {
            codigo: "DADOS_INVALIDOS",
            campos: {
              meio_candidatura: ["Informe um único meio de candidatura"],
              data_encerramento: ["A data de encerramento não pode estar no passado"],
            },
          },
          { status: 422 },
        ),
      ),
    );
    await preencherObrigatorios();
    await usuario.type(
      screen.getByLabelText("URL de candidatura"),
      "https://smartkanvas.com.br/vaga",
    );

    await usuario.click(botao("Salvar como rascunho"));

    expect(await screen.findByText("Informe um único meio de candidatura")).toBeInTheDocument();
    expect(
      screen.getByText("A data de encerramento não pode estar no passado"),
    ).toBeInTheDocument();
    expect(roteadorFalso.push).not.toHaveBeenCalled();
  });

  it("publica criando o rascunho e depois chamando a rota de publicar", async () => {
    await abrir();
    await preencherObrigatorios();
    await usuario.type(
      screen.getByLabelText("URL de candidatura"),
      "https://smartkanvas.com.br/vaga",
    );

    await usuario.click(botao("Publicar vaga"));

    await waitFor(() => expect(roteadorFalso.push).toHaveBeenCalledWith("/admin/vagas"));
    expect(avisos().getByText("Vaga publicada")).toBeInTheDocument();
    expect(chamadas.map(({ caminho }) => caminho)).toEqual([
      "/api/admin/oportunidades",
      `/api/admin/oportunidades/${ID_CRIADA}/publicar`,
    ]);
  });

  it("leva para a edição quando cria mas não consegue publicar", async () => {
    await abrir();
    servidor.use(
      http.post("*/api/admin/oportunidades/:id/publicar", () =>
        HttpResponse.json({ codigo: "OPORTUNIDADE_NAO_E_RASCUNHO" }, { status: 409 }),
      ),
    );
    await preencherObrigatorios();
    await usuario.type(
      screen.getByLabelText("URL de candidatura"),
      "https://smartkanvas.com.br/vaga",
    );

    await usuario.click(botao("Publicar vaga"));

    await waitFor(() =>
      expect(roteadorFalso.push).toHaveBeenCalledWith(`/admin/vagas/${ID_CRIADA}`),
    );
    expect(
      avisos().getByText(
        "O rascunho foi salvo, mas a vaga não foi publicada. Só rascunhos podem ser publicados.",
      ),
    ).toBeInTheDocument();
  });

  it("avisa erro genérico ao criar", async () => {
    await abrir();
    servidor.use(
      http.post("*/api/admin/oportunidades", () => HttpResponse.json({}, { status: 500 })),
    );
    await preencherObrigatorios();
    await usuario.type(
      screen.getByLabelText("URL de candidatura"),
      "https://smartkanvas.com.br/vaga",
    );

    await usuario.click(botao("Salvar como rascunho"));

    expect(
      await avisos().findByText("Não foi possível concluir a ação. Tente novamente."),
    ).toBeInTheDocument();
    expect(botao("Salvar como rascunho")).toBeEnabled();
  });
});
