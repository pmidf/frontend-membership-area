import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { perfilFiliado } from "@/test/fixtures/pessoas";
import { definirNavegacao } from "@/test/navegacao-falsa";
import { renderizar } from "@/test/renderizar";
import { servidor } from "@/test/servidor";

import { chavesBeneficios } from "../api/beneficios.queries";
import {
  detalheTeste,
  handlersResgate,
  resgateCupomTeste,
  resgateInstrucaoTeste,
} from "../mocks/beneficios.handlers";
import type { DetalheBeneficio, ResgateBeneficio } from "../tipos/beneficio";
import { PaginaDetalheBeneficio } from "./PaginaDetalheBeneficio";

const id = detalheTeste.id_beneficio;
const instrucao: DetalheBeneficio = { ...detalheTeste, tipo_resgate: "INSTRUCAO" };

let usuario: ReturnType<typeof userEvent.setup>;
let resgates: number;

beforeEach(() => {
  usuario = userEvent.setup({ delay: null });
  resgates = 0;
  servidor.events.on("request:start", ({ request }) => {
    if (request.method === "POST" && request.url.endsWith("/resgate")) resgates += 1;
  });
});

afterEach(() => {
  servidor.events.removeAllListeners();
  vi.restoreAllMocks();
});

function abrir(detalhe: DetalheBeneficio = detalheTeste, resgate?: ResgateBeneficio) {
  definirNavegacao(`/beneficios/${id}`, "", { id });
  const resultado = renderizar(<PaginaDetalheBeneficio />, { sessao: perfilFiliado });
  servidor.use(...handlersResgate(detalhe, resgate));
  return resultado;
}

const clicar = async (nome: string) =>
  usuario.click(await screen.findByRole("button", { name: nome }));
const dialogo = async (nome: string) => within(await screen.findByRole("dialog", { name: nome }));
const responderResgate = (status: number, corpo: object) =>
  servidor.use(
    http.post("*/api/beneficios/:id/resgate", () => HttpResponse.json(corpo, { status })),
  );

describe("Resgatar benefício de cupom", () => {
  it("mostra o registro, o código e o site do parceiro no primeiro resgate", async () => {
    abrir();

    await clicar("Resgatar vantagem");

    const modal = await dialogo("Seu código está pronto");
    expect(modal.getByText("Resgate registrado")).toBeInTheDocument();
    expect(modal.getByText(/salvo em 31\/08\/2026 às 14:22/)).toBeInTheDocument();
    expect(modal.getByText("PMIDF-BRISK-30OFF")).toBeInTheDocument();
    expect(modal.getByText(/Enviamos o mesmo código/)).toBeInTheDocument();
    expect(modal.getByRole("link", { name: /Ir para o site do parceiro/ })).toHaveAttribute(
      "href",
      "https://brisk.test",
    );
  });

  it("copia o código e confirma dentro do modal", async () => {
    abrir();
    await clicar("Resgatar vantagem");
    const modal = await dialogo("Seu código está pronto");

    await usuario.click(modal.getByRole("button", { name: "Copiar código" }));

    expect(await modal.findByRole("button", { name: "Código copiado" })).toBeInTheDocument();
    expect(await navigator.clipboard.readText()).toBe("PMIDF-BRISK-30OFF");
  });

  it("orienta a copiar manualmente quando a área de transferência falha", async () => {
    abrir();
    await clicar("Resgatar vantagem");
    const modal = await dialogo("Seu código está pronto");
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("negado"));

    await usuario.click(modal.getByRole("button", { name: "Copiar código" }));

    expect(await modal.findByRole("alert")).toHaveTextContent("copie manualmente");
  });

  it("muda para Ver código e reabre sem nova chamada nem alerta", async () => {
    abrir();
    await clicar("Resgatar vantagem");
    const modal = await dialogo("Seu código está pronto");
    await usuario.click(modal.getByRole("button", { name: "Fechar" }));

    await clicar("Ver código");

    const reaberto = await dialogo("Seu código está pronto");
    expect(reaberto.getByText("PMIDF-BRISK-30OFF")).toBeInTheDocument();
    expect(reaberto.queryByText("Resgate registrado")).toBeNull();
    expect(resgates).toBe(1);
  });

  it("mostra o mesmo código, sem o alerta, em benefício já resgatado", async () => {
    abrir({ ...detalheTeste, resgatado: true });

    await clicar("Ver código");

    const modal = await dialogo("Seu código está pronto");
    expect(modal.getByText("PMIDF-BRISK-30OFF")).toBeInTheDocument();
    expect(modal.queryByText("Resgate registrado")).toBeNull();
  });

  it("não mostra o link quando o parceiro não tem site", async () => {
    abrir(detalheTeste, { ...resgateCupomTeste, site_url: null } as ResgateBeneficio);

    await clicar("Resgatar vantagem");

    expect((await dialogo("Seu código está pronto")).queryByRole("link")).toBeNull();
  });

  it("não usa como link um endereço que não seja http(s)", async () => {
    abrir(detalheTeste, {
      ...resgateCupomTeste,
      site_url: "javascript:alert(1)",
    } as ResgateBeneficio);

    await clicar("Resgatar vantagem");

    expect((await dialogo("Seu código está pronto")).queryByRole("link")).toBeNull();
  });
});

describe("Resgatar benefício de instrução", () => {
  it("mostra a instrução formatada e sem scripts", async () => {
    abrir(instrucao, resgateInstrucaoTeste);

    await clicar("Resgatar vantagem");

    const modal = await dialogo("Siga as instruções");
    expect(modal.getByText("Resgate registrado")).toBeInTheDocument();
    expect(modal.getByText("parceiro").tagName).toBe("STRONG");
    expect(document.querySelector("dialog script")).toBeNull();
  });

  it("oferece Ver instruções depois do resgate, sem o alerta", async () => {
    abrir({ ...instrucao, resgatado: true }, resgateInstrucaoTeste);

    await clicar("Ver instruções");

    expect((await dialogo("Siga as instruções")).queryByText("Resgate registrado")).toBeNull();
  });
});

describe("Atualização das listas", () => {
  async function resgatarComCatalogoEmCache(detalhe: DetalheBeneficio) {
    const { clienteConsultas } = abrir(detalhe);
    const chave = chavesBeneficios.lista({}, true);
    clienteConsultas.setQueryData(chave, { total: 0, itens: [] });
    await clicar(detalhe.resgatado ? "Ver código" : "Resgatar vantagem");
    await dialogo("Seu código está pronto");
    return clienteConsultas.getQueryState(chave);
  }

  it("invalida o catálogo no primeiro resgate", async () => {
    expect((await resgatarComCatalogoEmCache(detalheTeste))?.isInvalidated).toBe(true);
  });

  it("não invalida ao consultar um código já resgatado", async () => {
    expect(
      (await resgatarComCatalogoEmCache({ ...detalheTeste, resgatado: true }))?.isInvalidated,
    ).toBe(false);
  });
});

describe("Erros do resgate", () => {
  it("abre o modal de filiação não vigente", async () => {
    abrir();
    responderResgate(403, { codigo: "FILIACAO_NECESSARIA" });

    await clicar("Resgatar vantagem");

    const modal = await dialogo("Sua filiação não está vigente");
    expect(modal.getByRole("link", { name: "Ver minha filiação" })).toHaveAttribute(
      "href",
      "/perfil#filiacao",
    );
    await usuario.click(modal.getAllByRole("button", { name: "Fechar" })[0]);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("pede a confirmação do e-mail, com o link", async () => {
    abrir();
    responderResgate(403, { codigo: "EMAIL_NAO_CONFIRMADO" });

    await clicar("Resgatar vantagem");

    expect(await screen.findByText("Confirme seu e-mail para resgatar.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Confirmar e-mail" })).toHaveAttribute(
      "href",
      `/confirmar-email?email=${encodeURIComponent(perfilFiliado.email!)}`,
    );
  });

  it("avisa do limite de resgates", async () => {
    abrir();
    responderResgate(429, {});

    await clicar("Resgatar vantagem");

    expect(await screen.findByText(/limite de 10 resgates por hora/)).toBeInTheDocument();
  });

  it("mostra a mensagem genérica em outras falhas", async () => {
    abrir();
    responderResgate(500, {});

    await clicar("Resgatar vantagem");

    expect(
      await screen.findByText("Não foi possível concluir a ação. Tente novamente."),
    ).toBeInTheDocument();
  });

  it("avisa e atualiza o detalhe quando o benefício saiu do ar", async () => {
    abrir();
    await screen.findByRole("button", { name: "Resgatar vantagem" });
    servidor.use(
      http.post("*/api/beneficios/:id/resgate", () =>
        HttpResponse.json({ codigo: "BENEFICIO_NAO_ENCONTRADO" }, { status: 404 }),
      ),
      http.get("*/api/beneficios/:id", () =>
        HttpResponse.json({ codigo: "BENEFICIO_NAO_ENCONTRADO" }, { status: 404 }),
      ),
    );

    await clicar("Resgatar vantagem");

    await waitFor(() =>
      expect(screen.getByText("Este benefício não está mais disponível")).toBeInTheDocument(),
    );
    expect(
      within(screen.getByRole("region", { name: "Avisos" })).getByText(
        "Este benefício não está mais disponível.",
      ),
    ).toBeInTheDocument();
  });
});
