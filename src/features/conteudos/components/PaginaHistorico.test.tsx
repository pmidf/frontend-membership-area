import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { beforeEach, describe, expect, it } from "vitest";

import type { Perfil } from "@/shared/sessao/tipos";
import { perfilFiliado, perfilNaoFiliado } from "@/test/fixtures/pessoas";
import { definirNavegacao, roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import {
  catalogoFiliado,
  COD_TECNOLOGIA,
  handlersConteudos,
  itemBloqueado,
  montarCatalogo,
  videoPublico,
  videoVisto,
} from "../mocks/conteudos.handlers";
import type { Catalogo, ItemCatalogo } from "../tipos/conteudo";
import { PaginaHistorico } from "./PaginaHistorico";

beforeEach(() => definirNavegacao("/conteudos/historico"));

function abrir(sessao: Perfil = perfilFiliado, catalogo?: Catalogo) {
  const resultado = renderizar(<PaginaHistorico />, { sessao });
  servidor.use(...handlersConteudos(catalogo));
  return resultado;
}

const comItens = (itens: ItemCatalogo[]) =>
  montarCatalogo([{ cod_categoria: COD_TECNOLOGIA, desc_categoria: "Tecnologia", itens }]);
const vistos = (quantidade: number) =>
  comItens(
    Array.from({ length: quantidade }, (_, indice) => ({
      ...videoVisto,
      id_conteudo: `id-${indice}`,
      titulo: `Visto ${indice}`,
    })),
  );
const cartoes = () => screen.findAllByRole("heading", { level: 3 });

describe("Histórico", () => {
  it("mostra só o que foi assistido e o link de volta", async () => {
    abrir(perfilFiliado, catalogoFiliado);

    expect(await cartoes()).toHaveLength(1);
    expect(screen.getByRole("link", { name: videoVisto.titulo })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: videoPublico.titulo })).toBeNull();
    expect(screen.getByRole("link", { name: /Voltar para o catálogo/ })).toHaveAttribute(
      "href",
      "/conteudos",
    );
  });

  it("pagina de 20 em 20 pela URL", async () => {
    abrir(perfilFiliado, vistos(25));

    expect(await cartoes()).toHaveLength(20);
    await userEvent.click(screen.getByRole("button", { name: "Próxima" }));

    expect(roteadorFalso.replace).toHaveBeenCalledWith("/conteudos/historico?pagina=2", {
      scroll: false,
    });
  });

  it("mostra o restante na segunda página", async () => {
    definirNavegacao("/conteudos/historico", "pagina=2");
    abrir(perfilFiliado, vistos(25));

    expect(await cartoes()).toHaveLength(5);
  });

  it("vai para a última página quando a da URL não existe", async () => {
    definirNavegacao("/conteudos/historico", "pagina=9");
    abrir(perfilFiliado, vistos(25));

    await waitFor(() =>
      expect(roteadorFalso.replace).toHaveBeenCalledWith("/conteudos/historico?pagina=2", {
        scroll: false,
      }),
    );
  });

  it("avisa quando nada foi assistido", async () => {
    abrir(perfilFiliado, comItens([videoPublico]));

    expect(
      await screen.findByText("Você ainda não assistiu a nenhum conteúdo"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Paginação" })).toBeNull();
  });

  it("mostra o erro e tenta de novo", async () => {
    let falhar = true;
    renderizar(<PaginaHistorico />, { sessao: perfilFiliado });
    servidor.use(
      http.get("*/api/conteudos", () =>
        falhar ? HttpResponse.json({}, { status: 500 }) : HttpResponse.json(vistos(1)),
      ),
    );

    expect(await screen.findByText("Não foi possível carregar os conteúdos.")).toBeInTheDocument();
    falhar = false;
    await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await cartoes()).toHaveLength(1);
  });

  it("para o Não-Filiado, mostra só públicos assistidos e nenhum bloqueado", async () => {
    abrir(perfilNaoFiliado, comItens([itemBloqueado, { ...videoPublico, consumido: true }]));

    const [cartao] = await cartoes();
    expect(within(cartao).getByRole("link", { name: videoPublico.titulo })).toBeInTheDocument();
    expect(screen.queryByText(itemBloqueado.titulo)).toBeNull();
    expect(screen.getByText(/^Conteúdos públicos que você já assistiu/)).toBeInTheDocument();
  });
});
