import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { perfilAdmin } from "@/test/fixtures/pessoas";
import { definirNavegacao, roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import type { BeneficioAdmin } from "../api/beneficios-admin.api";
import { beneficioAdminTeste, handlersBeneficioAdmin } from "../mocks/beneficios-admin.handlers";
import { PaginaEditarBeneficio } from "./PaginaEditarBeneficio";

const id = beneficioAdminTeste.id_beneficio;
const publicado: BeneficioAdmin = { ...beneficioAdminTeste, situacao: "PUBLICADO" };
const arquivado: BeneficioAdmin = { ...beneficioAdminTeste, situacao: "ARQUIVADO" };
const ESPERA = 4000;

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
    chamadas.push({
      metodo: request.method,
      caminho: pathname.split("/").at(-1) ?? "",
      corpo: texto ? JSON.parse(texto) : undefined,
    });
  });
});

afterEach(() => servidor.events.removeAllListeners());

async function abrir(beneficio: BeneficioAdmin = beneficioAdminTeste, consulta = "") {
  definirNavegacao(`/admin/beneficios/${id}`, consulta, { id });
  renderizar(<PaginaEditarBeneficio />, { sessao: perfilAdmin });
  servidor.use(...handlersBeneficioAdmin(beneficio));
  await screen.findByRole("heading", { name: "Editar benefício" }, { timeout: ESPERA });
}

const botao = (nome: string) => screen.getByRole("button", { name: nome });
const avisos = () => within(screen.getByRole("region", { name: "Avisos" }));

async function substituir(rotulo: string, valor: string) {
  const campo = screen.getByLabelText(rotulo);
  await usuario.clear(campo);
  await usuario.type(campo, valor);
}

async function confirmar(titulo: string, rotulo: string) {
  const dialogo = within(await screen.findByRole("dialog", { name: titulo }));
  await usuario.click(dialogo.getByRole("button", { name: rotulo }));
}

function responder(acao: string, status: number, corpo: object) {
  servidor.use(
    http.post(`*/api/admin/beneficios/:id/${acao}`, () => HttpResponse.json(corpo, { status })),
  );
}

function responderPatch(status: number, corpo: object) {
  servidor.use(
    http.patch("*/api/admin/beneficios/:id", () => HttpResponse.json(corpo, { status })),
  );
}

describe("Editar benefício", { timeout: 15_000 }, () => {
  it("preenche o formulário, com parceiro somente leitura", async () => {
    await abrir();

    expect(screen.getByLabelText("Título da vantagem")).toHaveValue("Voucher do exame PMP");
    expect(screen.getByLabelText("Parceiro")).toHaveValue("PMI Global");
    expect(screen.getByLabelText("Parceiro")).toHaveAttribute("readonly");
    expect(screen.getByLabelText("Código do cupom")).toHaveValue("PMI-2026");
    expect(screen.getByLabelText("Início da vigência")).toHaveValue("2026-01-01");
    expect(screen.getByText("0 resgates")).toBeInTheDocument();
  });

  it("oferece as ações do rascunho", async () => {
    await abrir();

    expect(botao("Salvar alterações")).toBeDisabled();
    expect(botao("Publicar benefício")).toBeEnabled();
    expect(botao("Arquivar")).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Despublicar" })).toBeNull();
  });

  it("envia só o campo alterado", async () => {
    await abrir();

    await substituir("Título da vantagem", "Voucher novo");
    await usuario.click(botao("Salvar alterações"));

    expect(await avisos().findByText("Alterações salvas.")).toBeInTheDocument();
    expect(chamadas).toEqual([{ metodo: "PATCH", caminho: id, corpo: { titulo: "Voucher novo" } }]);
    await waitFor(() => expect(botao("Salvar alterações")).toBeDisabled());
  });

  it("mostra o contador da legenda e bloqueia acima do limite", async () => {
    await abrir();

    await substituir("Legenda curta", "a".repeat(91));

    expect(screen.getByText(/^91 de 90 caracteres/)).toBeInTheDocument();
    await usuario.click(botao("Salvar alterações"));
    expect(await screen.findByText("Use no máximo 90 caracteres")).toBeInTheDocument();
    expect(chamadas).toEqual([]);
  });

  it("troca os campos conforme a forma de resgate e envia o outro como nulo", async () => {
    await abrir();

    await usuario.click(screen.getByRole("radio", { name: /Instrução por texto/ }));

    expect(screen.queryByLabelText("Código do cupom")).toBeNull();
    await usuario.click(botao("Salvar alterações"));
    expect(await screen.findByText("Informe a instrução de resgate")).toBeInTheDocument();
    expect(chamadas).toEqual([]);

    await usuario.type(screen.getByLabelText("Instrução de resgate"), "Fale com o parceiro");
    await usuario.click(botao("Salvar alterações"));

    await avisos().findByText("Alterações salvas.");
    expect(chamadas[0].corpo).toEqual({
      tipo_resgate: "INSTRUCAO",
      cod_cupom: null,
      desc_instrucao: "Fale com o parceiro",
    });
  });

  it("recusa o fim da vigência anterior ao início", async () => {
    await abrir();

    await substituir("Fim da vigência (opcional)", "2025-01-01");
    await usuario.click(botao("Salvar alterações"));

    expect(
      await screen.findByText("O fim da vigência não pode ser anterior ao início"),
    ).toBeInTheDocument();
  });

  it("atualiza a prévia do card ao digitar e tolera imagem inválida", async () => {
    await abrir();
    const previa = within(screen.getByRole("heading", { name: "Prévia do card" }).parentElement!);
    expect(previa.getByText("Voucher do exame PMP")).toBeInTheDocument();
    expect(previa.getByText("Parceiro: PMI Global")).toBeInTheDocument();

    await substituir("Título da vantagem", "Outro título");
    await substituir("URL da imagem", "nao-e-url");

    expect(previa.getByText("Outro título")).toBeInTheDocument();
    expect(previa.queryByRole("link")).toBeNull();
  });

  it("publica salvando antes as alterações pendentes", async () => {
    await abrir();

    await substituir("Título da vantagem", "Voucher novo");
    await usuario.click(botao("Publicar benefício"));

    expect(await avisos().findByText("Benefício publicado.")).toBeInTheDocument();
    expect(chamadas.map(({ metodo, caminho }) => `${metodo} ${caminho}`)).toEqual([
      `PATCH ${id}`,
      "POST publicar",
    ]);
    expect(await screen.findByRole("button", { name: "Despublicar" })).toBeInTheDocument();
  });

  it("não publica quando falha ao salvar", async () => {
    await abrir();
    responderPatch(422, { codigo: "DADOS_INVALIDOS", campos: { titulo: ["Título recusado"] } });

    await substituir("Título da vantagem", "Voucher novo");
    await usuario.click(botao("Publicar benefício"));

    expect(await screen.findByText("Título recusado")).toBeInTheDocument();
    expect(chamadas.map(({ caminho }) => caminho)).toEqual([id]);
  });

  it("despublica depois de confirmar", async () => {
    await abrir(publicado);

    await usuario.click(botao("Despublicar"));
    await confirmar("Despublicar benefício?", "Despublicar");

    expect(await avisos().findByText("Benefício despublicado.")).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: "Publicar benefício" })).toBeInTheDocument();
  });

  it("arquiva depois de confirmar e deixa o formulário somente leitura", async () => {
    await abrir(publicado);

    await usuario.click(botao("Arquivar"));
    await confirmar("Arquivar benefício?", "Arquivar");

    expect(
      await screen.findByRole("button", { name: "Duplicar como rascunho" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Título da vantagem")).toBeDisabled();
    expect(screen.getByText(/Para renovar a parceria/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Salvar alterações" })).toBeNull();
  });

  it("não chama a API ao cancelar a confirmação", async () => {
    await abrir(publicado);

    await usuario.click(botao("Arquivar"));
    await confirmar("Arquivar benefício?", "Cancelar");

    expect(chamadas).toEqual([]);
  });

  it("duplica o arquivado e vai para o novo rascunho", async () => {
    await abrir(arquivado);

    await usuario.click(botao("Duplicar como rascunho"));

    await waitFor(() =>
      expect(roteadorFalso.push).toHaveBeenCalledWith(
        "/admin/beneficios/40000000-0000-4000-8000-000000000099",
      ),
    );
    expect(
      avisos().getByText("Rascunho criado a partir do benefício arquivado"),
    ).toBeInTheDocument();
  });

  it("trava a forma de resgate quando já houve resgates", async () => {
    await abrir({ ...publicado, quantidade_resgates: 3 });

    expect(screen.getByRole("radio", { name: /Cupom compartilhado/ })).toBeDisabled();
    expect(screen.getByRole("radio", { name: /Instrução por texto/ })).toBeDisabled();
    expect(screen.getByText(/forma de resgate não pode mais mudar/)).toBeInTheDocument();
    expect(screen.getByText("3 resgates")).toBeInTheDocument();
  });

  it("mostra TIPO_BLOQUEADO na forma de resgate", async () => {
    await abrir();
    responderPatch(409, { codigo: "TIPO_BLOQUEADO" });

    await usuario.click(screen.getByRole("radio", { name: /Instrução por texto/ }));
    await usuario.type(screen.getByLabelText("Instrução de resgate"), "Passo");
    await usuario.click(botao("Salvar alterações"));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Já houve resgates: a forma de resgate não pode mais mudar.",
    );
  });

  it("recarrega a situação quando outro Admin já mudou o benefício", async () => {
    await abrir();
    responder("publicar", 409, { codigo: "BENEFICIO_ARQUIVADO" });
    servidor.use(http.get("*/api/admin/beneficios/:id", () => HttpResponse.json(arquivado)));

    await usuario.click(botao("Publicar benefício"));

    expect(await avisos().findByText(/foi arquivado/)).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "Duplicar como rascunho" }),
    ).toBeInTheDocument();
  });

  it("explica quando só um arquivado pode ser duplicado", async () => {
    await abrir(arquivado);
    responder("duplicar", 409, { codigo: "BENEFICIO_NAO_ARQUIVADO" });

    await usuario.click(botao("Duplicar como rascunho"));

    expect(
      await avisos().findByText("Só é possível duplicar um benefício arquivado."),
    ).toBeInTheDocument();
  });

  it("volta para a lista mantendo os filtros", async () => {
    await abrir(beneficioAdminTeste, "situacao=RASCUNHO&pagina=2");

    expect(screen.getByRole("link", { name: "Voltar para a lista de benefícios" })).toHaveAttribute(
      "href",
      "/admin/beneficios?situacao=RASCUNHO&pagina=2",
    );
  });

  it("mostra benefício não encontrado", async () => {
    definirNavegacao("/admin/beneficios/x", "", { id: "x" });
    renderizar(<PaginaEditarBeneficio />, { sessao: perfilAdmin });

    expect(
      await screen.findByText("Benefício não encontrado", {}, { timeout: ESPERA }),
    ).toBeInTheDocument();
  });

  it("mostra erro e tenta de novo", async () => {
    let falhar = true;
    definirNavegacao(`/admin/beneficios/${id}`, "", { id });
    renderizar(<PaginaEditarBeneficio />, { sessao: perfilAdmin });
    servidor.use(
      http.get("*/api/admin/beneficios/:id", () =>
        falhar ? HttpResponse.json({}, { status: 500 }) : HttpResponse.json(beneficioAdminTeste),
      ),
    );

    expect(
      await screen.findByText("Não foi possível carregar o benefício.", {}, { timeout: ESPERA }),
    ).toBeInTheDocument();
    falhar = false;
    await usuario.click(botao("Tentar novamente"));

    expect(await screen.findByRole("heading", { name: "Editar benefício" })).toBeInTheDocument();
  });
});
