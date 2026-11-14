import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { beforeEach, describe, expect, it } from "vitest";

import { COD_MATERIAIS } from "@/features/conteudos/mocks/conteudos.handlers";
import { perfilAdmin } from "@/test/fixtures/pessoas";
import { definirNavegacao, roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import {
  conteudoArquivado,
  conteudoRascunho,
  conteudoVideo,
  conteudosAdminTeste,
  filtrarConteudosAdmin,
  handlersConteudosAdmin,
} from "../mocks/conteudos-admin.handlers";
import { PaginaConteudosAdmin } from "./PaginaConteudosAdmin";

let usuario: ReturnType<typeof userEvent.setup>;

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
});

const ESPERA_DA_TABELA = 4000;

function abrir(consulta = "") {
  definirNavegacao("/admin/conteudos", consulta);
  const resultado = renderizar(<PaginaConteudosAdmin />, { sessao: perfilAdmin });
  servidor.use(...handlersConteudosAdmin());
  roteadorFalso.replace.mockImplementation((destino: string) => {
    const [caminho, parametros = ""] = destino.split("?");
    definirNavegacao(caminho, parametros);
    queueMicrotask(() => resultado.rerender(<PaginaConteudosAdmin />));
  });
  return resultado;
}

const tabela = () =>
  screen.findByRole("table", { name: "Biblioteca de conteúdos" }, { timeout: ESPERA_DA_TABELA });

async function linhas() {
  await tabela();
  return within(screen.getByRole("table")).getAllByRole("row").slice(1);
}

const substituicao = (destino: string) =>
  waitFor(() => expect(roteadorFalso.replace).toHaveBeenCalledWith(destino, { scroll: false }));

const linha = (titulo: string) => within(screen.getByRole("row", { name: new RegExp(titulo) }));

describe("Biblioteca de conteúdos do Admin", { timeout: 15_000 }, () => {
  it("mostra os indicadores, 20 conteúdos e a paginação", async () => {
    abrir();

    expect(await linhas()).toHaveLength(20);
    const publicados = (await screen.findByText("Publicados")).parentElement!;
    await waitFor(() => expect(publicados).toHaveTextContent("23Publicados"));
    const rascunhos = screen.getByText("Rascunhos").parentElement!;
    await waitFor(() => expect(rascunhos).toHaveTextContent("1Rascunhos"));
    expect(screen.getByText("Página 1 de 2")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Biblioteca" })).toBeInTheDocument();
  });

  it("descreve cada conteúdo com categoria, tipo, acesso, status e ações", async () => {
    abrir();
    await tabela();

    const video = linha(conteudoVideo.titulo);
    expect(video.getByText("Tecnologia")).toBeInTheDocument();
    expect(video.getByText("Vídeo")).toBeInTheDocument();
    expect(video.getByText("Filiado")).toBeInTheDocument();
    expect(video.getByText("Publicado")).toBeInTheDocument();
    expect(video.getByRole("link", { name: `Editar ${conteudoVideo.titulo}` })).toHaveAttribute(
      "href",
      `/admin/conteudos/${conteudoVideo.id_conteudo}`,
    );
    expect(
      video.getByRole("link", { name: `Ver estatísticas de ${conteudoVideo.titulo}` }),
    ).toHaveAttribute("href", `/admin/conteudos/${conteudoVideo.id_conteudo}/estatisticas`);

    const rascunho = linha(conteudoRascunho.titulo);
    expect(rascunho.getByText("Público")).toBeInTheDocument();
    expect(rascunho.getByText("Rascunho")).toBeInTheDocument();
    expect(rascunho.queryByRole("link", { name: /Ver estatísticas/ })).toBeNull();

    const arquivado = linha(conteudoArquivado.titulo);
    expect(arquivado.getByText("Material")).toBeInTheDocument();
    expect(arquivado.getByText("Arquivado")).toBeInTheDocument();
    expect(
      arquivado.getByRole("link", { name: `Ver ${conteudoArquivado.titulo}` }),
    ).toBeInTheDocument();
  });

  it("filtra rascunhos e volta para a página 1", async () => {
    abrir("pagina=2");
    await tabela();

    await usuario.selectOptions(screen.getByLabelText("Status"), "RASCUNHO");

    await substituicao("/admin/conteudos?situacao=RASCUNHO");
    await waitFor(async () => expect(await linhas()).toHaveLength(1));
  });

  it.each([
    ["Tipo", "MATERIAL", "tipo"],
    ["Categoria", COD_MATERIAIS, "categoria"],
  ])("grava o filtro %s na URL", async (rotulo, valor, parametro) => {
    abrir();
    await tabela();
    await waitFor(() =>
      expect(within(screen.getByLabelText("Categoria")).getAllByRole("option")).toHaveLength(3),
    );

    await usuario.selectOptions(screen.getByLabelText(rotulo), valor);

    await substituicao(`/admin/conteudos?${parametro}=${valor}`);
  });

  it("busca e grava o termo na URL", async () => {
    abrir();
    await tabela();

    await usuario.type(screen.getByRole("searchbox"), "canvas");

    await substituicao("/admin/conteudos?q=canvas");
    await waitFor(async () => expect(await linhas()).toHaveLength(1));
  });

  it("restaura os filtros da URL e os leva para a edição", async () => {
    abrir("situacao=ARQUIVADO&q=canvas");

    await waitFor(async () => expect(await linhas()).toHaveLength(1));
    expect(screen.getByLabelText("Status")).toHaveValue("ARQUIVADO");
    expect(screen.getByRole("searchbox")).toHaveValue("canvas");
    expect(screen.getByRole("link", { name: `Ver ${conteudoArquivado.titulo}` })).toHaveAttribute(
      "href",
      `/admin/conteudos/${conteudoArquivado.id_conteudo}?situacao=ARQUIVADO&q=canvas`,
    );
  });

  it("volta para a última página ao passar do fim", async () => {
    abrir("pagina=9");

    await substituicao("/admin/conteudos?pagina=2");
  });

  it("leva + Adicionar conteúdo para a rota de cadastro", async () => {
    abrir();

    expect(await screen.findByRole("link", { name: "+ Adicionar conteúdo" })).toHaveAttribute(
      "href",
      "/admin/conteudos/novo",
    );
  });

  it("abre e fecha o modal de categorias", async () => {
    abrir();
    await tabela();

    await usuario.click(screen.getByRole("button", { name: "Gerenciar categorias" }));
    const dialogo = await screen.findByRole("dialog", { name: "Categorias" });
    expect(await within(dialogo).findByText("Tecnologia")).toBeInTheDocument();

    await usuario.click(within(dialogo).getByRole("button", { name: "Concluir" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("mostra o vazio e limpa os filtros", async () => {
    abrir("q=inexistente&tipo=VIDEO");

    expect(
      await screen.findByText("Nenhum conteúdo encontrado", {}, { timeout: ESPERA_DA_TABELA }),
    ).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Limpar filtros" }));

    await substituicao("/admin/conteudos");
    await waitFor(() => expect(screen.getByRole("searchbox")).toHaveValue(""));
    expect(screen.getByLabelText("Tipo")).toHaveValue("");
  });

  it("mostra o erro e tenta de novo", async () => {
    let falhar = true;
    abrir();
    servidor.use(
      http.get("*/api/admin/conteudos", ({ request }) =>
        falhar
          ? HttpResponse.json({}, { status: 500 })
          : HttpResponse.json(filtrarConteudosAdmin(conteudosAdminTeste, new URL(request.url))),
      ),
    );

    expect(
      await screen.findByText(
        "Não foi possível carregar os conteúdos.",
        {},
        { timeout: ESPERA_DA_TABELA },
      ),
    ).toBeInTheDocument();
    falhar = false;
    await usuario.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await linhas()).toHaveLength(20);
  });
});
