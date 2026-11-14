import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  categoriasTeste,
  COD_MATERIAIS,
  COD_TECNOLOGIA,
} from "@/features/conteudos/mocks/conteudos.handlers";
import { perfilAdmin } from "@/test/fixtures/pessoas";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { handlersCategoriasAdmin } from "../mocks/conteudos-admin.handlers";
import { ModalCategorias } from "./ModalCategorias";

let usuario: ReturnType<typeof userEvent.setup>;
let chamadas: { metodo: string; caminho: string; corpo: unknown }[];

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
  chamadas = [];
  servidor.events.on("request:start", async ({ request }) => {
    const { pathname } = new URL(request.url);
    if (request.method === "GET" || !pathname.startsWith("/api/admin/conteudo-categorias")) return;
    chamadas.push({
      metodo: request.method,
      caminho: pathname,
      corpo: await request.clone().json(),
    });
  });
});

afterEach(() => servidor.events.removeAllListeners());

async function abrir(categorias = categoriasTeste) {
  const aoFechar = vi.fn();
  renderizar(<ModalCategorias aberto aoFechar={aoFechar} />, { sessao: perfilAdmin });
  servidor.use(...handlersCategoriasAdmin(categorias));
  await screen.findByRole("list", { name: "Categorias na ordem do catálogo" }, { timeout: 4000 });
  return aoFechar;
}

const nomes = () =>
  within(screen.getByRole("list", { name: "Categorias na ordem do catálogo" }))
    .getAllByRole("listitem")
    .map((item) => item.querySelector("span.font-medium")?.textContent);
const avisos = () => within(screen.getByRole("region", { name: "Avisos" }));
const botao = (nome: string) => screen.getByRole("button", { name: nome });

describe("Gerenciar categorias", { timeout: 15_000 }, () => {
  it("lista na ordem do catálogo e trava as setas das pontas", async () => {
    await abrir();

    expect(screen.getByRole("dialog", { name: "Categorias" })).toBeInTheDocument();
    expect(nomes()).toEqual(["Tecnologia", "Materiais"]);
    expect(botao("Subir Tecnologia")).toBeDisabled();
    expect(botao("Descer Materiais")).toBeDisabled();
    expect(botao("Descer Tecnologia")).toBeEnabled();
  });

  it("troca a ordem e grava a nova posição das duas categorias", async () => {
    await abrir();

    await usuario.click(botao("Descer Tecnologia"));

    await waitFor(() => expect(nomes()).toEqual(["Materiais", "Tecnologia"]));
    await waitFor(() => expect(chamadas).toHaveLength(2));
    expect(chamadas).toEqual(
      expect.arrayContaining([
        {
          metodo: "PATCH",
          caminho: `/api/admin/conteudo-categorias/${COD_TECNOLOGIA}`,
          corpo: { ordem: 2 },
        },
        {
          metodo: "PATCH",
          caminho: `/api/admin/conteudo-categorias/${COD_MATERIAIS}`,
          corpo: { ordem: 1 },
        },
      ]),
    );
  });

  it("renumera quando as categorias têm a mesma ordem", async () => {
    await abrir(categoriasTeste.map((categoria) => ({ ...categoria, ordem: 0 })));

    await usuario.click(botao("Descer Materiais"));

    await waitFor(() => expect(chamadas).toHaveLength(2));
    await waitFor(() => expect(nomes()).toEqual(["Tecnologia", "Materiais"]));
  });

  it("desfaz a troca e avisa quando a ordem não é gravada", async () => {
    await abrir();
    servidor.use(
      http.patch("*/api/admin/conteudo-categorias/:id", () =>
        HttpResponse.json({}, { status: 500 }),
      ),
    );

    await usuario.click(botao("Descer Tecnologia"));

    expect(
      await avisos().findByText("Não foi possível mudar a ordem. Tente novamente."),
    ).toBeInTheDocument();
    await waitFor(() => expect(nomes()).toEqual(["Tecnologia", "Materiais"]));
  });

  it("renomeia uma categoria", async () => {
    await abrir();

    await usuario.click(botao("Renomear Materiais"));
    const campo = screen.getByLabelText("Nome da categoria");
    expect(campo).toHaveFocus();
    await usuario.clear(campo);
    await usuario.type(campo, "Materiais de apoio");
    await usuario.click(botao("Salvar"));

    expect(await avisos().findByText("Categoria renomeada")).toBeInTheDocument();
    await waitFor(() => expect(nomes()).toEqual(["Tecnologia", "Materiais de apoio"]));
    expect(chamadas[0].corpo).toEqual({ desc_categoria: "Materiais de apoio" });
  });

  it("mostra no campo o nome repetido e o nome vazio", async () => {
    await abrir();
    await usuario.click(botao("Renomear Materiais"));
    const campo = screen.getByLabelText("Nome da categoria");

    await usuario.clear(campo);
    await usuario.click(botao("Salvar"));
    expect(screen.getByText("Informe o nome da categoria")).toBeInTheDocument();

    await usuario.type(campo, "Tecnologia");
    await usuario.click(botao("Salvar"));
    expect(await screen.findByText("Já existe uma categoria com esse nome.")).toBeInTheDocument();
  });

  it("cancela a edição e fecha sem chamar a API quando o nome não muda", async () => {
    await abrir();

    await usuario.click(botao("Renomear Tecnologia"));
    await usuario.click(botao("Cancelar"));
    expect(screen.queryByLabelText("Nome da categoria")).toBeNull();

    await usuario.click(botao("Renomear Tecnologia"));
    await usuario.click(botao("Salvar"));
    expect(screen.queryByLabelText("Nome da categoria")).toBeNull();
    expect(chamadas).toHaveLength(0);
  });

  it("cria uma categoria no fim da lista e limpa o campo", async () => {
    await abrir();

    await usuario.type(screen.getByLabelText("Nova categoria"), "  Carreira ");
    await usuario.click(botao("+ Adicionar"));

    expect(await avisos().findByText("Categoria Carreira criada")).toBeInTheDocument();
    await waitFor(() => expect(nomes()).toEqual(["Tecnologia", "Materiais", "Carreira"]));
    expect(screen.getByLabelText("Nova categoria")).toHaveValue("");
    expect(chamadas[0].corpo).toEqual({ desc_categoria: "Carreira" });
  });

  it("valida a nova categoria e mostra o nome repetido", async () => {
    await abrir();

    await usuario.click(botao("+ Adicionar"));
    expect(screen.getByText("Informe o nome da categoria")).toBeInTheDocument();

    await usuario.type(screen.getByLabelText("Nova categoria"), "Tecnologia");
    await usuario.click(botao("+ Adicionar"));
    expect(await screen.findByText("Já existe uma categoria com esse nome.")).toBeInTheDocument();
  });

  it("mostra a mensagem do backend para nome inválido", async () => {
    await abrir();
    servidor.use(
      http.post("*/api/admin/conteudo-categorias", () =>
        HttpResponse.json(
          { codigo: "DADOS_INVALIDOS", campos: { desc_categoria: ["Nome longo demais"] } },
          { status: 422 },
        ),
      ),
    );

    await usuario.type(screen.getByLabelText("Nova categoria"), "Qualquer");
    await usuario.click(botao("+ Adicionar"));

    expect(await screen.findByText("Nome longo demais")).toBeInTheDocument();
  });

  it("mostra o erro de carregamento e tenta de novo", async () => {
    let falhar = true;
    renderizar(<ModalCategorias aberto aoFechar={vi.fn()} />, { sessao: perfilAdmin });
    servidor.use(
      http.get("*/api/conteudo-categorias", () =>
        falhar ? HttpResponse.json({}, { status: 500 }) : HttpResponse.json(categoriasTeste),
      ),
    );

    expect(
      await screen.findByText("Não foi possível carregar as categorias.", {}, { timeout: 4000 }),
    ).toBeInTheDocument();
    falhar = false;
    await usuario.click(botao("Tentar novamente"));

    await waitFor(() => expect(nomes()).toEqual(["Tecnologia", "Materiais"]));
  });

  it("fecha em Concluir", async () => {
    const aoFechar = await abrir();

    await usuario.click(botao("Concluir"));

    expect(aoFechar).toHaveBeenCalled();
  });
});
