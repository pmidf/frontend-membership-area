import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { perfilAdmin } from "@/test/fixtures/pessoas";
import { definirNavegacao, roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import {
  handlersParceiros,
  ID_BENEFICIO_CRIADO,
  ID_PARCEIRO_CRIADO,
  parceirosTeste,
} from "../mocks/beneficios-admin.handlers";
import { PaginaNovoBeneficio } from "./PaginaNovoBeneficio";

const ESPERA = 4000;
const [PMI, BRISK] = parceirosTeste;

let usuario: ReturnType<typeof userEvent.setup>;
let chamadas: { metodo: string; caminho: string; corpo: unknown }[];

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
  chamadas = [];
  servidor.events.on("request:start", async ({ request }) => {
    if (request.method === "GET") return;
    const { pathname } = new URL(request.url);
    if (!pathname.startsWith("/api/admin/beneficios")) return;
    const texto = await request.clone().text();
    chamadas.push({ metodo: request.method, caminho: pathname, corpo: texto && JSON.parse(texto) });
  });
});

afterEach(() => servidor.events.removeAllListeners());

async function abrir({ esperarParceiros = true } = {}) {
  definirNavegacao("/admin/beneficios/novo");
  renderizar(<PaginaNovoBeneficio />, { sessao: perfilAdmin });
  await screen.findByRole("heading", { level: 1, name: "Novo benefício" });
  if (esperarParceiros) {
    await screen.findByRole("option", { name: PMI.nome }, { timeout: ESPERA });
  }
}

const botao = (nome: string) => screen.getByRole("button", { name: nome });
const avisos = () => within(screen.getByRole("region", { name: "Avisos" }));
const previa = () => within(screen.getByRole("heading", { name: "Prévia do card" }).parentElement!);

function responder(metodo: "post", caminho: string, status: number, corpo: object) {
  servidor.use(http[metodo](caminho, () => HttpResponse.json(corpo, { status })));
}

async function preencher({ legenda = "Desconto no exame" } = {}) {
  await usuario.type(screen.getByLabelText("Título da vantagem"), "30% no curso PMP");
  await usuario.type(screen.getByLabelText("Legenda curta"), legenda);
  await usuario.type(screen.getByLabelText("Descrição completa"), "Linha um.");
  await usuario.selectOptions(screen.getByLabelText("Categoria"), "CERTIFICACAO");
  await usuario.selectOptions(screen.getByLabelText("Parceiro"), BRISK.cod_parceiro);
  await usuario.type(screen.getByLabelText("URL da imagem"), "https://exemplo.test/pmp.png");
  await usuario.type(screen.getByLabelText("Código do cupom"), " PMP30 ");
  await usuario.type(screen.getByLabelText("Início da vigência"), "2026-12-01");
}

describe("Novo benefício", { timeout: 15_000 }, () => {
  it("começa como rascunho, com cupom e a nota de publicação", async () => {
    await abrir();

    expect(screen.getAllByText("Rascunho").length).toBeGreaterThan(0);
    expect(screen.getByText("Filiados ativos")).toBeInTheDocument();
    expect(screen.getByText(/Publicar torna o benefício visível na hora/)).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Cupom compartilhado/ })).toBeChecked();
    expect(screen.getByLabelText("Parceiro")).toHaveValue("");
  });

  it("troca os campos conforme a forma de resgate", async () => {
    await abrir();

    await usuario.click(screen.getByRole("radio", { name: /Instrução por texto/ }));
    expect(screen.queryByLabelText("Código do cupom")).toBeNull();
    expect(screen.getByLabelText("Instrução de resgate")).toBeInTheDocument();

    await usuario.click(botao("Salvar rascunho"));
    expect(await screen.findByText("Informe a instrução de resgate")).toBeInTheDocument();

    await usuario.click(screen.getByRole("radio", { name: /Cupom compartilhado/ }));
    expect(screen.queryByLabelText("Instrução de resgate")).toBeNull();
    await usuario.click(botao("Salvar rascunho"));
    expect(await screen.findByText("Informe o código do cupom")).toBeInTheDocument();
  });

  it("valida os obrigatórios sem chamar o backend", async () => {
    await abrir();

    await usuario.click(botao("Salvar rascunho"));

    expect(await screen.findByText("Informe o título")).toBeInTheDocument();
    expect(screen.getByText("Informe a legenda")).toBeInTheDocument();
    expect(screen.getByText("Selecione o parceiro", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText("Informe o início da vigência")).toBeInTheDocument();
    expect(chamadas).toHaveLength(0);
  });

  it("conta a legenda e bloqueia o envio acima de 90 caracteres", async () => {
    await abrir();
    await preencher({ legenda: "a".repeat(91) });

    expect(screen.getByText(/91 de 90 caracteres/)).toBeInTheDocument();
    await usuario.click(botao("Salvar rascunho"));

    expect(await screen.findByText("Use no máximo 90 caracteres")).toBeInTheDocument();
    expect(chamadas).toHaveLength(0);
  });

  it("mostra o erro no fim da vigência anterior ao início", async () => {
    await abrir();
    await preencher();
    await usuario.type(screen.getByLabelText("Fim da vigência (opcional)"), "2026-11-30");

    await usuario.click(botao("Salvar rascunho"));

    expect(
      await screen.findByText("O fim da vigência não pode ser anterior ao início"),
    ).toBeInTheDocument();
    expect(chamadas).toHaveLength(0);
  });

  it("atualiza a miniatura e a prévia do card ao digitar", async () => {
    await abrir();
    expect(previa().getByText("Título da vantagem")).toBeInTheDocument();
    expect(previa().getByText("Parceiro: Parceiro")).toBeInTheDocument();

    await usuario.type(screen.getByLabelText("Título da vantagem"), "30% no curso PMP");
    await usuario.selectOptions(screen.getByLabelText("Categoria"), "CARREIRA");
    await usuario.selectOptions(screen.getByLabelText("Parceiro"), BRISK.cod_parceiro);
    await usuario.type(screen.getByLabelText("URL da imagem"), "https://exemplo.test/pmp.png");
    await usuario.tab();

    expect(previa().getByText("30% no curso PMP")).toBeInTheDocument();
    expect(previa().getByText("Parceiro: Brisk Educação")).toBeInTheDocument();
    expect(previa().getByText("Carreira")).toBeInTheDocument();
    expect(screen.getByAltText("Miniatura da imagem do benefício")).toBeInTheDocument();
  });

  it("abre a prévia do filiado em um modal", async () => {
    await abrir();
    await usuario.type(screen.getByLabelText("Título da vantagem"), "Voucher");

    await usuario.click(botao("Ver como o filiado vê"));

    const dialogo = within(await screen.findByRole("dialog", { name: "Prévia do card" }));
    expect(dialogo.getByText("Voucher")).toBeInTheDocument();
    await usuario.click(dialogo.getByRole("button", { name: "Fechar" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("salva o rascunho e leva para a edição", async () => {
    await abrir();
    await preencher();

    await usuario.click(botao("Salvar rascunho"));

    await waitFor(() =>
      expect(roteadorFalso.push).toHaveBeenCalledWith(`/admin/beneficios/${ID_BENEFICIO_CRIADO}`),
    );
    expect(avisos().getByText("Rascunho salvo")).toBeInTheDocument();
    expect(chamadas).toEqual([
      {
        metodo: "POST",
        caminho: "/api/admin/beneficios",
        corpo: {
          titulo: "30% no curso PMP",
          legenda: "Desconto no exame",
          descricao: "Linha um.",
          imagem: "https://exemplo.test/pmp.png",
          categoria: "CERTIFICACAO",
          cod_parceiro: BRISK.cod_parceiro,
          tipo_resgate: "CUPOM",
          cod_cupom: "PMP30",
          desc_instrucao: null,
          vigencia_inicio: "2026-12-01",
          vigencia_fim: null,
        },
      },
    ]);
  });

  it("publica em duas chamadas e volta para a lista", async () => {
    await abrir();
    await preencher();

    await usuario.click(botao("Publicar benefício"));

    await waitFor(() => expect(roteadorFalso.push).toHaveBeenCalledWith("/admin/beneficios"));
    expect(avisos().getByText("Benefício publicado")).toBeInTheDocument();
    expect(chamadas.map(({ caminho }) => caminho)).toEqual([
      "/api/admin/beneficios",
      `/api/admin/beneficios/${ID_BENEFICIO_CRIADO}/publicar`,
    ]);
  });

  it("fica no rascunho criado quando a publicação falha", async () => {
    await abrir();
    responder("post", "*/api/admin/beneficios/:id/publicar", 500, {});
    await preencher();

    await usuario.click(botao("Publicar benefício"));

    await waitFor(() =>
      expect(roteadorFalso.push).toHaveBeenCalledWith(`/admin/beneficios/${ID_BENEFICIO_CRIADO}`),
    );
    expect(
      avisos().getByText(/o rascunho foi salvo, mas não foi possível publicar/i),
    ).toBeInTheDocument();
  });

  it("avisa que o benefício arquivado não pode ser publicado", async () => {
    await abrir();
    responder("post", "*/api/admin/beneficios/:id/publicar", 409, {
      codigo: "BENEFICIO_ARQUIVADO",
    });
    await preencher();

    await usuario.click(botao("Publicar benefício"));

    expect(
      await avisos().findByText("Este benefício foi arquivado e não pode ser publicado."),
    ).toBeInTheDocument();
    expect(roteadorFalso.push).toHaveBeenCalledWith(`/admin/beneficios/${ID_BENEFICIO_CRIADO}`);
  });

  it("informa quando já estava publicado e volta para a lista", async () => {
    await abrir();
    responder("post", "*/api/admin/beneficios/:id/publicar", 409, {
      codigo: "BENEFICIO_JA_PUBLICADO",
    });
    await preencher();

    await usuario.click(botao("Publicar benefício"));

    expect(await avisos().findByText("Este benefício já está publicado.")).toBeInTheDocument();
    expect(roteadorFalso.push).toHaveBeenCalledWith("/admin/beneficios");
  });

  it("leva o erro de parceiro do backend para o seletor", async () => {
    await abrir();
    responder("post", "*/api/admin/beneficios", 422, {
      codigo: "DADOS_INVALIDOS",
      campos: { cod_parceiro: ["Parceiro não encontrado"] },
    });
    await preencher();

    await usuario.click(botao("Salvar rascunho"));

    expect(await screen.findByText("Parceiro não encontrado")).toBeInTheDocument();
    expect(screen.getByLabelText("Parceiro")).toHaveAttribute("aria-invalid", "true");
    expect(roteadorFalso.push).not.toHaveBeenCalled();
    expect(botao("Salvar rascunho")).toBeEnabled();
  });

  it("avisa erro genérico ao criar", async () => {
    await abrir();
    responder("post", "*/api/admin/beneficios", 500, {});
    await preencher();

    await usuario.click(botao("Salvar rascunho"));

    expect(
      await avisos().findByText("Não foi possível concluir a ação. Tente novamente."),
    ).toBeInTheDocument();
  });

  it("mostra a lista de parceiros indisponível e tenta de novo", async () => {
    let falhar = true;
    servidor.use(
      http.get("*/api/admin/parceiros", () =>
        falhar ? HttpResponse.json({}, { status: 500 }) : HttpResponse.json(parceirosTeste),
      ),
    );
    await abrir({ esperarParceiros: false });

    expect(
      await screen.findByText("Lista de parceiros indisponível", undefined, { timeout: ESPERA }),
    ).toBeInTheDocument();
    await usuario.click(botao("Salvar rascunho"));
    expect(await screen.findByText("Selecione o parceiro")).toBeInTheDocument();

    falhar = false;
    await usuario.click(botao("Tentar novamente"));

    expect(
      await screen.findByRole("option", { name: PMI.nome }, { timeout: ESPERA }),
    ).toBeInTheDocument();
  });
});

describe("Parceiro do novo benefício", { timeout: 15_000 }, () => {
  let criacoes: unknown[];

  beforeEach(() => {
    servidor.use(...handlersParceiros());
    criacoes = [];
    servidor.events.on("request:start", async ({ request }) => {
      if (request.method !== "POST") return;
      if (new URL(request.url).pathname !== "/api/admin/parceiros") return;
      criacoes.push(await request.clone().json());
    });
  });

  const opcoesDoSeletor = () =>
    within(screen.getByLabelText("Parceiro"))
      .getAllByRole("option")
      .map((opcao) => opcao.textContent);

  const dialogo = () => within(screen.getByRole("dialog", { name: "Novo parceiro" }));

  async function abrirModal() {
    await usuario.click(botao("Novo parceiro"));
    return within(await screen.findByRole("dialog", { name: "Novo parceiro" }));
  }

  it("busca o parceiro pelo nome, sem acentos, sem esconder o já escolhido", async () => {
    await abrir();
    await usuario.selectOptions(screen.getByLabelText("Parceiro"), PMI.cod_parceiro);

    await usuario.type(screen.getByRole("searchbox", { name: "Buscar parceiro" }), "educacao");

    expect(opcoesDoSeletor()).toEqual(["Selecione o parceiro", PMI.nome, BRISK.nome]);
    expect(screen.getByLabelText("Parceiro")).toHaveValue(PMI.cod_parceiro);
  });

  it("avisa quando a busca não encontra parceiro", async () => {
    await abrir();

    await usuario.type(screen.getByRole("searchbox", { name: "Buscar parceiro" }), "zzz{Enter}");

    expect(opcoesDoSeletor()).toEqual(["Nenhum parceiro encontrado"]);
    expect(chamadas).toHaveLength(0);
  });

  it("cadastra um parceiro no modal e já o seleciona", async () => {
    await abrir();
    const modal = await abrirModal();
    expect(modal.getByLabelText("Nome do parceiro")).toHaveFocus();

    await usuario.type(modal.getByLabelText("Nome do parceiro"), "  Escola Ágil ");
    await usuario.type(modal.getByLabelText("Descrição (opcional)"), "Cursos de agilidade");
    await usuario.type(modal.getByLabelText("Site (opcional)"), "https://escolaagil.com.br");
    await usuario.click(modal.getByRole("button", { name: "Salvar parceiro" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(criacoes).toEqual([
      {
        nome: "Escola Ágil",
        descricao: "Cursos de agilidade",
        site_url: "https://escolaagil.com.br",
      },
    ]);
    expect(avisos().getByText("Parceiro Escola Ágil cadastrado")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Escola Ágil" })).toBeInTheDocument();
    expect(screen.getByLabelText("Parceiro")).toHaveValue(ID_PARCEIRO_CRIADO);
    expect(previa().getByText("Parceiro: Escola Ágil")).toBeInTheDocument();
    expect(chamadas).toHaveLength(0);
  });

  it("envia só o nome quando descrição e site ficam vazios", async () => {
    await abrir();
    const modal = await abrirModal();

    await usuario.type(modal.getByLabelText("Nome do parceiro"), "Só Nome");
    await usuario.click(modal.getByRole("button", { name: "Salvar parceiro" }));

    await waitFor(() => expect(criacoes).toEqual([{ nome: "Só Nome" }]));
  });

  it("valida nome e site sem chamar o backend", async () => {
    await abrir();
    const modal = await abrirModal();

    await usuario.type(modal.getByLabelText("Site (opcional)"), "escola agil");
    await usuario.click(modal.getByRole("button", { name: "Salvar parceiro" }));

    expect(await modal.findByText("Informe o nome do parceiro")).toBeInTheDocument();
    expect(modal.getByText("Informe uma URL http(s) válida")).toBeInTheDocument();
    expect(criacoes).toHaveLength(0);
  });

  it("mostra no campo nome quando o parceiro já existe", async () => {
    await abrir();
    const modal = await abrirModal();

    await usuario.type(modal.getByLabelText("Nome do parceiro"), "impact hub");
    await usuario.click(modal.getByRole("button", { name: "Salvar parceiro" }));

    expect(await modal.findByText("Já existe um parceiro com esse nome.")).toBeInTheDocument();
    expect(modal.getByLabelText("Nome do parceiro")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Parceiro")).toHaveValue("");
  });

  it("leva os erros de campo do backend para o modal", async () => {
    servidor.use(
      http.post("*/api/admin/parceiros", () =>
        HttpResponse.json(
          { codigo: "DADOS_INVALIDOS", campos: { site_url: ["site_url must be a URL address"] } },
          { status: 422 },
        ),
      ),
    );
    await abrir();
    const modal = await abrirModal();

    await usuario.type(modal.getByLabelText("Nome do parceiro"), "Nova Escola");
    await usuario.click(modal.getByRole("button", { name: "Salvar parceiro" }));

    expect(await modal.findByText("site_url must be a URL address")).toBeInTheDocument();
  });

  it("avisa erro genérico e mantém o modal aberto", async () => {
    servidor.use(http.post("*/api/admin/parceiros", () => HttpResponse.json({}, { status: 500 })));
    await abrir();
    const modal = await abrirModal();

    await usuario.type(modal.getByLabelText("Nome do parceiro"), "Nova Escola");
    await usuario.click(modal.getByRole("button", { name: "Salvar parceiro" }));

    expect(
      await avisos().findByText("Não foi possível concluir a ação. Tente novamente."),
    ).toBeInTheDocument();
    expect(dialogo().getByLabelText("Nome do parceiro")).toHaveValue("Nova Escola");
  });

  it("cancela sem cadastrar e limpa o modal ao reabrir", async () => {
    await abrir();
    const modal = await abrirModal();

    await usuario.type(modal.getByLabelText("Nome do parceiro"), "Desisti");
    await usuario.click(modal.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("dialog")).toBeNull();
    expect(criacoes).toHaveLength(0);
    expect(screen.getByLabelText("Parceiro")).toHaveValue("");

    const reaberto = await abrirModal();
    expect(reaberto.getByLabelText("Nome do parceiro")).toHaveValue("");
  });
});
