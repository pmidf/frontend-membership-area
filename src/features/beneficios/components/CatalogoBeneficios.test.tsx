import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { beforeEach, describe, expect, it } from "vitest";

import { perfilFiliado } from "@/test/fixtures/pessoas";
import { definirNavegacao, roteadorFalso } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { detalheTeste, handlersCatalogo } from "../mocks/beneficios.handlers";
import type { DetalheBeneficio } from "../tipos/beneficio";
import { PaginaBeneficios } from "./PaginaBeneficios";
import { PaginaDetalheBeneficio } from "./PaginaDetalheBeneficio";

let usuario: ReturnType<typeof userEvent.setup>;

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
});

function abrirCatalogo(consulta = "") {
  definirNavegacao("/beneficios", consulta);
  const resultado = renderizar(<PaginaBeneficios />, { sessao: perfilFiliado });
  servidor.use(...handlersCatalogo());
  roteadorFalso.replace.mockImplementation((destino: string) => {
    const [caminho, parametros = ""] = destino.split("?");
    definirNavegacao(caminho, parametros);
    queueMicrotask(() => resultado.rerender(<PaginaBeneficios />));
  });
  return resultado;
}

const lista = () => screen.findByRole("list", { name: "Benefícios" });
const cartoes = async () => within(await lista()).getAllByRole("listitem");
const cartaoDe = async (titulo: string) => {
  await lista();
  return screen.getByRole("link", { name: titulo }).closest("li")!;
};
const substituicao = (destino: string) =>
  waitFor(() => expect(roteadorFalso.replace).toHaveBeenCalledWith(destino, { scroll: false }));

describe("Catálogo", () => {
  it("mostra os cartões, o total geral e os chips das categorias devolvidas", async () => {
    abrirCatalogo();

    expect(await cartoes()).toHaveLength(20);
    expect(await screen.findByText(/^25 vantagens ativas/)).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Categorias" })).toHaveTextContent(
      "TodasEducaçãoCertificaçãoFerramentasCarreira",
    );
    expect(screen.getByRole("button", { name: "Todas" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("region", { name: "Exclusivo para filiados" })).toBeNull();
  });

  it("mostra categoria, parceiro e validade no cartão", async () => {
    abrirCatalogo();

    const cartao = within(await cartaoDe("30% em cursos de preparação PMP"));
    expect(cartao.getByText("Educação")).toBeInTheDocument();
    expect(cartao.getByText("Parceiro: Brisk Educação")).toBeInTheDocument();
    expect(cartao.getByText("Válido até 31/12/2099")).toBeInTheDocument();
    expect(cartao.getByText("Resgatar")).toBeInTheDocument();
  });

  it("destaca em vermelho o benefício que termina em breve", async () => {
    abrirCatalogo();

    expect(
      within(await cartaoDe("Voucher do exame PMP")).getByText(/^Termina em 5 dias$/),
    ).toHaveClass("text-texto-erro");
  });

  it("indica resgate anterior e benefício sem data de término", async () => {
    abrirCatalogo();

    const resgatado = within(await cartaoDe("Trilha de Business Agility"));
    expect(resgatado.getByText("Você já resgatou")).toBeInTheDocument();
    expect(resgatado.getByText("Ver código")).toBeInTheDocument();
    expect(
      within(await cartaoDe("Licença de cronograma")).getByText("Sem data de término"),
    ).toBeInTheDocument();
  });

  it("tem um único link por cartão, que leva ao detalhe mantendo os filtros", async () => {
    abrirCatalogo("categoria=EDUCACAO");

    await waitFor(async () => expect(await cartoes()).toHaveLength(2));
    const cartao = await cartaoDe("Trilha de Business Agility");
    expect(within(cartao).getAllByRole("link")).toHaveLength(1);
    expect(within(cartao).queryByRole("button")).toBeNull();
    expect(within(cartao).getByRole("link")).toHaveAttribute(
      "href",
      "/beneficios/20000000-0000-4000-8000-000000000004?categoria=EDUCACAO",
    );
  });

  it("filtra pela busca depois do atraso, grava na URL e mantém o total geral", async () => {
    abrirCatalogo("pagina=2");
    await lista();

    await usuario.type(screen.getByRole("searchbox"), "PMP");
    expect(roteadorFalso.replace).not.toHaveBeenCalled();

    await substituicao("/beneficios?q=PMP");
    await waitFor(async () => expect(await cartoes()).toHaveLength(2));
    expect(screen.getByText(/^25 vantagens ativas/)).toBeInTheDocument();
  });

  it("filtra pela categoria e volta para a página 1", async () => {
    abrirCatalogo("pagina=2");
    await lista();

    await usuario.click(screen.getByRole("button", { name: "Ferramentas" }));

    await substituicao("/beneficios?categoria=FERRAMENTAS");
    await waitFor(async () => expect(await cartoes()).toHaveLength(1));
    expect(screen.getByRole("button", { name: "Ferramentas" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("volta a mostrar tudo com o chip Todas", async () => {
    abrirCatalogo("categoria=FERRAMENTAS");
    await waitFor(async () => expect(await cartoes()).toHaveLength(1));

    await usuario.click(screen.getByRole("button", { name: "Todas" }));

    await substituicao("/beneficios");
  });

  it("pagina pela URL", async () => {
    abrirCatalogo();
    await lista();

    await usuario.click(screen.getByRole("button", { name: "Próxima" }));

    await substituicao("/beneficios?pagina=2");
    await waitFor(async () => expect(await cartoes()).toHaveLength(5));
  });

  it("restaura busca, categoria e página da URL", async () => {
    abrirCatalogo("q=vantagem&pagina=2");

    await waitFor(async () => expect(await cartoes()).toHaveLength(1));
    expect(screen.getByRole("searchbox")).toHaveValue("vantagem");
    expect(screen.getByText("Página 2 de 2")).toBeInTheDocument();
  });

  it("ignora categoria inválida da URL sem chamar a API com ela", async () => {
    let consulta = "";
    servidor.events.on("request:start", ({ request }) => {
      if (new URL(request.url).pathname === "/api/beneficios")
        consulta = new URL(request.url).search;
    });
    abrirCatalogo("categoria=INVALIDA");

    expect(await cartoes()).toHaveLength(20);
    expect(consulta).toBe("");
    servidor.events.removeAllListeners();
  });

  it("volta para a última página ao passar do fim", async () => {
    abrirCatalogo("pagina=9");

    await substituicao("/beneficios?pagina=2");
  });

  it("mostra o vazio com o termo e limpa busca e filtros", async () => {
    abrirCatalogo("q=inexistente&categoria=EDUCACAO");

    expect(
      await screen.findByText("Nenhum benefício encontrado para 'inexistente'"),
    ).toBeInTheDocument();
    await usuario.click(screen.getByRole("button", { name: "Limpar filtros" }));

    await substituicao("/beneficios");
    await waitFor(() => expect(screen.getByRole("searchbox")).toHaveValue(""));
  });

  it("não oferece limpar quando não há filtros", async () => {
    definirNavegacao("/beneficios");
    renderizar(<PaginaBeneficios />, { sessao: perfilFiliado });
    servidor.use(...handlersCatalogo([]));

    expect(await screen.findByText("Novos benefícios em breve.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Limpar filtros" })).toBeNull();
  });
});

describe("Detalhe do benefício", () => {
  const id = detalheTeste.id_beneficio;

  function abrirDetalhe(beneficio: DetalheBeneficio = detalheTeste, consulta = "") {
    definirNavegacao(`/beneficios/${id}`, consulta, { id });
    renderizar(<PaginaDetalheBeneficio />, { sessao: perfilFiliado });
    servidor.use(http.get("*/api/beneficios/:id", () => HttpResponse.json(beneficio)));
  }

  it("mostra imagem, etiquetas, título, parceiro, vigência e descrição", async () => {
    abrirDetalhe();

    expect(
      await screen.findByRole("heading", { name: detalheTeste.titulo, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Educação")).toBeInTheDocument();
    expect(screen.getByText("Exclusivo para filiados")).toBeInTheDocument();
    expect(
      screen.getByText("Parceiro: Brisk Educação · vigente de 01/06/2026 a 30/11/2027"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Desconto aplicado/)).toHaveClass("whitespace-pre-line");
    expect(screen.getByText("Cupom compartilhado")).toBeInTheDocument();
    expect(screen.getByText("30/11/2027")).toBeInTheDocument();
  });

  it("descreve benefício de instrução e sem data de término", async () => {
    abrirDetalhe({ ...detalheTeste, tipo_resgate: "INSTRUCAO", vigencia_fim: null });

    expect(await screen.findByText("Instrução do parceiro")).toBeInTheDocument();
    expect(screen.getByText("Sem data de término")).toBeInTheDocument();
    expect(screen.getByText(/vigente desde 01\/06\/2026$/)).toBeInTheDocument();
  });

  it("volta para o clube mantendo os filtros", async () => {
    abrirDetalhe(detalheTeste, "q=pmp&pagina=2");
    await screen.findByRole("heading", { level: 1 });

    expect(screen.getByRole("link", { name: "Voltar para o clube de benefícios" })).toHaveAttribute(
      "href",
      "/beneficios?q=pmp&pagina=2",
    );
  });

  it("avisa quando o benefício não está mais disponível", async () => {
    abrirDetalhe();
    servidor.use(
      http.get("*/api/beneficios/:id", () =>
        HttpResponse.json({ codigo: "BENEFICIO_NAO_ENCONTRADO" }, { status: 404 }),
      ),
    );

    expect(await screen.findByText("Este benefício não está mais disponível")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir para o clube de benefícios" })).toBeInTheDocument();
  });

  it("mostra erro e tenta de novo", async () => {
    let falhar = true;
    abrirDetalhe();
    servidor.use(
      http.get("*/api/beneficios/:id", () =>
        falhar ? HttpResponse.json({}, { status: 500 }) : HttpResponse.json(detalheTeste),
      ),
    );

    expect(
      await screen.findByText("Não foi possível carregar o benefício.", {}, { timeout: 4000 }),
    ).toBeInTheDocument();
    falhar = false;
    await usuario.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(await screen.findByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
